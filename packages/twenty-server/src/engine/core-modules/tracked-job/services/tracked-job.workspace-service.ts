import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { setTimeout } from 'node:timers/promises';
import { type PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { z } from 'zod';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import {
  type UserWorkspaceAuthContext,
  type WorkspaceAuthContext,
} from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildUserAuthContext } from 'src/engine/core-modules/auth/utils/build-user-auth-context.util';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TRACKED_JOB_CONNECTION_TTL_MS } from 'src/engine/core-modules/tracked-job/constants/tracked-job-connection-ttl-ms.constant';
import { TRACKED_JOB_PERMISSION_CACHE_KEYS } from 'src/engine/core-modules/tracked-job/constants/tracked-job-permission-cache-keys.constant';
import { TRACKED_JOB_PROGRESS_INTERVAL_MS } from 'src/engine/core-modules/tracked-job/constants/tracked-job-progress-interval-ms.constant';
import { UPDATE_TRACKED_JOB_LEASE_SCRIPT } from 'src/engine/core-modules/tracked-job/constants/update-tracked-job-lease-script.constant';
import { TrackedJobException } from 'src/engine/core-modules/tracked-job/exceptions/tracked-job.exception';
import { type TrackedJobProgress } from 'src/engine/core-modules/tracked-job/types/tracked-job-progress.type';
import { type TrackedJobUpdate } from 'src/engine/core-modules/tracked-job/types/tracked-job-update.type';
import { type TrackedJob } from 'src/engine/core-modules/tracked-job/types/tracked-job.type';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { fromUserEntityToFlat } from 'src/engine/core-modules/user/utils/from-user-entity-to-flat.util';
import { fromWorkspaceEntityToFlat } from 'src/engine/core-modules/workspace/utils/from-workspace-entity-to-flat.util';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { wrapAsyncIteratorWithLifecycle } from 'src/engine/subscriptions/utils/wrap-async-iterator-with-lifecycle';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { combineCacheHashes } from 'src/engine/workspace-cache/utils/combine-cache-hashes.util';

@Injectable()
export class TrackedJobWorkspaceService {
  constructor(
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly permissionsService: PermissionsService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @Inject(CacheStorageNamespace.EngineTrackedJob)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async start<
    TData extends object,
    TProgress extends TrackedJobProgress,
    TUpdate,
  >({
    authContext,
    permissionFlag,
    queue,
    jobName,
    data,
    maxDurationMs,
    progressSchema,
    messages,
    toUpdate,
    onCancel,
  }: {
    authContext: WorkspaceAuthContext;
    permissionFlag?: PermissionFlagType;
    queue: MessageQueueService;
    jobName: string;
    data: TData;
    maxDurationMs: number;
    progressSchema: z.ZodType<TProgress>;
    messages: { alreadyRunning: string; interrupted: string };
    toUpdate: (
      update: TrackedJobUpdate<TProgress>,
      trackedJob: TrackedJob & TData,
    ) => Promise<TUpdate> | TUpdate;
    onCancel?: (trackedJob: TrackedJob & TData) => Promise<void>;
  }): Promise<AsyncIterableIterator<TUpdate>> {
    const requester = await this.assertRequester(authContext, permissionFlag);
    const trackedJob: TrackedJob & TData = {
      ...data,
      id: v4(),
      jobName,
      workspaceId: requester.workspace.id,
      userWorkspaceId: requester.userWorkspaceId,
      workspaceMemberId: requester.workspaceMemberId,
      permissionFlag,
      permissionsHash: await this.capturePermissionsHash(
        requester.workspace.id,
      ),
      expiresAt: Date.now() + maxDurationMs,
    };

    const acquired = await this.cacheStorageService.setIfAbsent(
      this.getLeaseKey(trackedJob),
      trackedJob.id,
      TRACKED_JOB_CONNECTION_TTL_MS,
    );

    if (!acquired) {
      throw new ConflictException(messages.alreadyRunning);
    }

    const service = this;
    let jobId: string;
    let isCompleted = false;

    async function* updates(signal: AbortSignal): AsyncGenerator<TUpdate> {
      while (!signal.aborted) {
        const update = await service.getUpdate({
          queue,
          jobId,
          expiresAt: trackedJob.expiresAt,
          progressSchema,
          interruptedMessage: messages.interrupted,
        });
        const payload = await toUpdate(update, trackedJob);

        if (signal.aborted) {
          return;
        }
        isCompleted = update.status === 'completed';
        yield payload;
        if (update.status !== 'running') {
          return;
        }
        await setTimeout(TRACKED_JOB_PROGRESS_INTERVAL_MS, undefined, {
          signal,
        });
      }
    }

    const stream = wrapAsyncIteratorWithLifecycle(updates, {
      heartbeatStart: 'immediate',
      heartbeatErrorBehavior: 'close',
      heartbeatIntervalMs: TRACKED_JOB_PROGRESS_INTERVAL_MS,
      onHeartbeat: async () => {
        if (isCompleted) {
          return false;
        }
        if (
          Date.now() > trackedJob.expiresAt ||
          !(await this.updateLease(trackedJob, TRACKED_JOB_CONNECTION_TTL_MS))
        ) {
          throw new BadRequestException(messages.interrupted);
        }

        return true;
      },
      onCleanup: async () => {
        await this.updateLease(trackedJob, 0);
        if (!isCompleted) {
          await onCancel?.(trackedJob);
        }
      },
    });

    try {
      const queuedJobId = await queue.add(jobName, trackedJob, {
        id: trackedJob.id,
      });

      if (!isDefined(queuedJobId)) {
        throw new TrackedJobException(
          'The job could not be queued',
          'QUEUE_UNAVAILABLE',
        );
      }
      jobId = queuedJobId;
    } catch (error) {
      await stream.return?.();
      throw error;
    }

    return stream;
  }

  async assertRequester(
    authContext: WorkspaceAuthContext,
    permissionFlag?: PermissionFlagType,
  ): Promise<UserWorkspaceAuthContext> {
    if (
      !isUserAuthContext(authContext) ||
      isDefined(authContext.application) ||
      isDefined(authContext.viaApplication)
    ) {
      throw new ForbiddenException(t`Sign in to continue.`);
    }

    if (
      isDefined(permissionFlag) &&
      !(await this.permissionsService.userHasWorkspaceSettingPermission({
        workspaceId: authContext.workspace.id,
        userWorkspaceId: authContext.userWorkspaceId,
        applicationId: undefined,
        setting: permissionFlag,
      }))
    ) {
      throw new ForbiddenException(t`You do not have permission to do this.`);
    }

    return authContext;
  }

  async resolveRequester(
    trackedJob: Pick<
      TrackedJob,
      'workspaceId' | 'userWorkspaceId' | 'workspaceMemberId' | 'permissionFlag'
    >,
  ): Promise<UserWorkspaceAuthContext> {
    const workspaceMember = await this.userWorkspaceService.getWorkspaceMember({
      workspaceId: trackedJob.workspaceId,
      workspaceMemberId: trackedJob.workspaceMemberId,
    });

    if (!isDefined(workspaceMember)) {
      throw new ForbiddenException(
        t`You are no longer a member of this workspace.`,
      );
    }

    const userWorkspace =
      await this.userWorkspaceService.getUserWorkspaceForUser({
        userId: workspaceMember.userId,
        workspaceId: trackedJob.workspaceId,
        relations: ['user', 'workspace'],
      });

    if (
      !isDefined(userWorkspace) ||
      userWorkspace.id !== trackedJob.userWorkspaceId
    ) {
      throw new ForbiddenException(
        t`You are no longer a member of this workspace.`,
      );
    }

    return this.assertRequester(
      buildUserAuthContext({
        workspace: fromWorkspaceEntityToFlat(userWorkspace.workspace),
        user: fromUserEntityToFlat(userWorkspace.user),
        userWorkspaceId: userWorkspace.id,
        workspaceMember,
        workspaceMemberId: workspaceMember.id,
      }),
      trackedJob.permissionFlag,
    );
  }

  async assertPermissionsUnchanged(
    trackedJob: Pick<TrackedJob, 'workspaceId' | 'permissionsHash'>,
  ): Promise<void> {
    if (
      trackedJob.permissionsHash !==
      (await this.workspaceCacheService.getOrRecomputeCombinedHash(
        trackedJob.workspaceId,
        TRACKED_JOB_PERMISSION_CACHE_KEYS,
      ))
    ) {
      throw new ForbiddenException(
        t`Access permissions have changed. Please try again.`,
      );
    }
  }

  async assertConnected(
    trackedJob: Pick<TrackedJob, 'id' | 'jobName' | 'workspaceId'>,
    signal: AbortSignal,
  ): Promise<void> {
    signal.throwIfAborted();
    if (
      (await this.cacheStorageService.get<string>(
        this.getLeaseKey(trackedJob),
      )) !== trackedJob.id
    ) {
      throw new TrackedJobException('Connection closed', 'CONNECTION_CLOSED');
    }
  }

  private async getUpdate<TProgress extends TrackedJobProgress>({
    queue,
    jobId,
    expiresAt,
    progressSchema,
    interruptedMessage,
  }: {
    queue: MessageQueueService;
    jobId: string;
    expiresAt: number;
    progressSchema: z.ZodType<TProgress>;
    interruptedMessage: string;
  }): Promise<TrackedJobUpdate<TProgress>> {
    const job = (await queue.getJobs([jobId]))[jobId];
    const progress = progressSchema.safeParse(job?.progress).data;
    const percentage =
      isDefined(progress) && progress.totalCount > 0
        ? Math.min(
            99,
            Math.floor((100 * progress.processedCount) / progress.totalCount),
          )
        : 0;

    if (!isDefined(job) || job.state === 'failed' || Date.now() > expiresAt) {
      return {
        status: 'failed',
        percentage,
        progress,
        errorMessage:
          z.object({ errorMessage: z.string() }).safeParse(job?.progress).data
            ?.errorMessage ?? interruptedMessage,
      };
    }

    if (job.state === 'completed') {
      return {
        status: 'completed',
        percentage: 100,
        progress,
        errorMessage: null,
      };
    }

    return { status: 'running', percentage, progress, errorMessage: null };
  }

  private async capturePermissionsHash(workspaceId: string): Promise<string> {
    const { hashes } =
      await this.workspaceCacheService.getOrRecomputeWithHashes(
        workspaceId,
        TRACKED_JOB_PERMISSION_CACHE_KEYS,
      );

    return combineCacheHashes(hashes, TRACKED_JOB_PERMISSION_CACHE_KEYS);
  }

  private async updateLease(
    trackedJob: Pick<TrackedJob, 'id' | 'jobName' | 'workspaceId'>,
    ttl: number,
  ): Promise<boolean> {
    return (
      (await this.cacheStorageService.runScript<number>({
        script: UPDATE_TRACKED_JOB_LEASE_SCRIPT,
        keys: [this.getLeaseKey(trackedJob)],
        args: [JSON.stringify(trackedJob.id), String(ttl)],
      })) === 1
    );
  }

  private getLeaseKey({
    workspaceId,
    jobName,
  }: Pick<TrackedJob, 'jobName' | 'workspaceId'>): string {
    return `{${workspaceId}}:${jobName}:active`;
  }
}
