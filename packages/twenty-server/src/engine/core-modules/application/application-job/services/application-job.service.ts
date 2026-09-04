import { Injectable } from '@nestjs/common';

import {
  type EnqueueJobItem,
  type EnqueueJobResult,
  type EnqueueJobsResult,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { bullMQToJobStateEnum } from 'src/engine/core-modules/message-queue/enums/job-state.enum';
import { ENQUEUE_JOB_DEFAULT_RETRY_LIMIT } from 'src/engine/core-modules/application/application-job/constants/enqueue-job-default-retry-limit.constant';
import { ENQUEUE_JOB_PRIORITY } from 'src/engine/core-modules/application/application-job/constants/enqueue-job-priority.constant';
import { MAX_JOBS_PER_STATUS_READ } from 'src/engine/core-modules/application/application-job/constants/max-jobs-per-status-read.constant';
import { type EnqueueJobInputDTO } from 'src/engine/core-modules/application/application-job/dtos/enqueue-job.input';
import { type EnqueueJobsInputDTO } from 'src/engine/core-modules/application/application-job/dtos/enqueue-jobs.input';
import { type JobStatusDTO } from 'src/engine/core-modules/application/application-job/dtos/job-status.dto';
import { buildQueueJobId } from 'src/engine/core-modules/application/application-job/utils/build-queue-job-id.util';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import {
  LogicFunctionTriggerJob,
  type LogicFunctionTriggerJobData,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { LOGIC_FUNCTION_QUEUE_RETRY_BACKOFF } from 'src/engine/core-modules/logic-function/logic-function-trigger/constants/logic-function-queue-retry-backoff.constant';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class ApplicationJobService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectMessageQueue(MessageQueue.logicFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async enqueueJob({
    applicationId,
    workspaceId,
    userId,
    userWorkspaceId,
    input,
  }: {
    applicationId: string;
    workspaceId: string;
    userId: string | null;
    userWorkspaceId: string | null;
    input: EnqueueJobInputDTO;
  }): Promise<EnqueueJobResult> {
    const { enqueued, logicFunctionUniversalIdentifier, jobIds } =
      await this.enqueueJobs({
        applicationId,
        workspaceId,
        userId,
        userWorkspaceId,
        input: {
          logicFunctionUniversalIdentifier:
            input.logicFunctionUniversalIdentifier,
          jobs: [{ payload: input.payload ?? {}, jobId: input.jobId }],
          retryLimit: input.retryLimit,
          delayMs: input.delayMs,
        },
      });

    return { enqueued, logicFunctionUniversalIdentifier, jobId: jobIds[0] };
  }

  async enqueueJobs({
    applicationId,
    workspaceId,
    userId,
    userWorkspaceId,
    input,
  }: {
    applicationId: string;
    workspaceId: string;
    userId: string | null;
    userWorkspaceId: string | null;
    input: EnqueueJobsInputDTO;
  }): Promise<EnqueueJobsResult> {
    const { logicFunctionUniversalIdentifier } = input;

    const jobItems = this.getJobItems(input);

    const { flatLogicFunctionMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatLogicFunctionMaps',
      ]);

    const flatLogicFunction = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatLogicFunctionMaps,
      universalIdentifier: logicFunctionUniversalIdentifier,
    });

    if (
      !isDefined(flatLogicFunction) ||
      isDefined(flatLogicFunction.deletedAt) ||
      flatLogicFunction.applicationId !== applicationId
    ) {
      throw new ApplicationException(
        `Logic function ${logicFunctionUniversalIdentifier} not found in this application`,
        ApplicationExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    const jobIds = jobItems.map((jobItem) => jobItem.jobId ?? v4());

    await this.messageQueueService.bulkAdd<LogicFunctionTriggerJobData>(
      LogicFunctionTriggerJob.name,
      jobItems.map((jobItem, index) => ({
        data: {
          logicFunctionId: flatLogicFunction.id,
          workspaceId,
          payload: jobItem.payload ?? {},
          ...(isDefined(userId) ? { userId } : {}),
          ...(isDefined(userWorkspaceId) ? { userWorkspaceId } : {}),
        },
        jobId: buildQueueJobId({ workspaceId, jobId: jobIds[index] }),
      })),
      {
        retryLimit: input.retryLimit ?? ENQUEUE_JOB_DEFAULT_RETRY_LIMIT,
        backoff: LOGIC_FUNCTION_QUEUE_RETRY_BACKOFF,
        priority: ENQUEUE_JOB_PRIORITY,
        ...(isDefined(input.delayMs) ? { delay: input.delayMs } : {}),
      },
    );

    return {
      enqueued: true,
      logicFunctionUniversalIdentifier,
      enqueuedJobsCount: jobItems.length,
      jobIds,
    };
  }

  async getJobs({
    workspaceId,
    jobIds,
  }: {
    workspaceId: string;
    jobIds: string[];
  }): Promise<JobStatusDTO[]> {
    if (jobIds.length > MAX_JOBS_PER_STATUS_READ) {
      throw new ApplicationException(
        `Cannot read more than ${MAX_JOBS_PER_STATUS_READ} jobs at once`,
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }

    const jobsByQueueJobId = await this.messageQueueService.getJobs(
      jobIds.map((jobId) => buildQueueJobId({ workspaceId, jobId })),
    );

    return jobIds.flatMap((jobId) => {
      const job = jobsByQueueJobId[buildQueueJobId({ workspaceId, jobId })];

      if (!isDefined(job)) {
        return [];
      }

      return [
        {
          jobId,
          state: bullMQToJobStateEnum[job.state],
          attemptsMade: job.attemptsMade,
          failedReason: job.failedReason,
          enqueuedAt: job.timestamp,
          startedAt: job.processedOn,
          finishedAt: job.finishedOn,
        },
      ];
    });
  }

  private getJobItems(input: EnqueueJobsInputDTO): EnqueueJobItem[] {
    if (isDefined(input.jobs) && isDefined(input.payloads)) {
      throw new ApplicationException(
        'Provide either jobs or payloads, not both',
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }

    if (isDefined(input.jobs)) {
      const callerSuppliedJobIds = input.jobs
        .map((job) => job.jobId)
        .filter(isDefined);

      if (new Set(callerSuppliedJobIds).size !== callerSuppliedJobIds.length) {
        throw new ApplicationException(
          'Job ids must be unique within a batch',
          ApplicationExceptionCode.INVALID_INPUT,
        );
      }

      return input.jobs;
    }

    if (isDefined(input.payloads)) {
      return input.payloads.map((payload) => ({ payload }));
    }

    throw new ApplicationException(
      'Either jobs or payloads must be provided',
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }
}
