import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, type Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import {
  buildWorkspaceUninstallHookPayload,
  type UninstallHookPayload,
  type WorkspaceUninstallHookRequestType,
} from 'src/engine/core-modules/application/application-manifest/utils/build-workspace-uninstall-hook-payload.util';
import { isApplicationUninstallHookPending } from 'src/engine/core-modules/application/utils/is-application-uninstall-hook-pending.util';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';

type ApplicationForUninstallHook = Pick<
  ApplicationEntity,
  | 'id'
  | 'uninstallLogicFunctionId'
  | 'uninstallHookCompletedForRequestedAt'
  | 'universalIdentifier'
  | 'version'
>;

type WorkspaceUninstallHookRequest = {
  requestedAt: Date;
  type: WorkspaceUninstallHookRequestType;
};

@Injectable()
export class ApplicationUninstallService {
  private readonly logger = new Logger(ApplicationUninstallService.name);

  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly applicationService: ApplicationService,
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
  ) {}

  async runUninstallHooksForWorkspaceDeletion({
    workspaceId,
    workspaceDeletedAt,
  }: {
    workspaceId: string;
    workspaceDeletedAt: Date;
  }): Promise<void> {
    await this.runUninstallHooksForWorkspaceRequest({
      workspaceId,
      workspaceUninstallHookRequest: {
        requestedAt: workspaceDeletedAt,
        type: 'workspace-deletion',
      },
    });
  }

  async runUninstallHooksForWorkspaceSuspension({
    workspaceId,
    workspaceSuspendedAt,
  }: {
    workspaceId: string;
    workspaceSuspendedAt: Date;
  }): Promise<void> {
    await this.runUninstallHooksForWorkspaceRequest({
      workspaceId,
      workspaceUninstallHookRequest: {
        requestedAt: workspaceSuspendedAt,
        type: 'workspace-suspension',
      },
    });
  }

  // Last-resort execution before the workspace hard deletion destroys the
  // applications and their hook functions, so a failing hook cannot block
  // erasing the workspace data.
  async runUninstallHooksForWorkspaceDeletionBestEffort({
    workspaceId,
    workspaceDeletedAt,
  }: {
    workspaceId: string;
    workspaceDeletedAt: Date;
  }): Promise<void> {
    try {
      await this.runUninstallHooksForWorkspaceDeletion({
        workspaceId,
        workspaceDeletedAt,
      });
    } catch (error) {
      this.logger.warn(
        `Uninstall hooks failed before hard deleting workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async findWorkspaceIdsWithPendingUninstallHooks(
    workspaceUninstallRequests: {
      workspaceId: string;
      uninstallRequestedAt: Date;
    }[],
  ): Promise<Set<string>> {
    if (workspaceUninstallRequests.length === 0) {
      return new Set();
    }

    const applications = await this.applicationRepository.find({
      select: [
        'workspaceId',
        'uninstallLogicFunctionId',
        'uninstallHookCompletedForRequestedAt',
      ],
      where: {
        workspaceId: In(
          workspaceUninstallRequests.map((request) => request.workspaceId),
        ),
      },
    });
    const uninstallRequestedAtByWorkspaceId = new Map(
      workspaceUninstallRequests.map((request) => [
        request.workspaceId,
        request.uninstallRequestedAt,
      ]),
    );
    const workspaceIdsWithPendingUninstallHooks = new Set<string>();

    for (const application of applications) {
      const uninstallRequestedAt = uninstallRequestedAtByWorkspaceId.get(
        application.workspaceId,
      );

      if (
        isDefined(uninstallRequestedAt) &&
        isApplicationUninstallHookPending(application, uninstallRequestedAt)
      ) {
        workspaceIdsWithPendingUninstallHooks.add(application.workspaceId);
      }
    }

    return workspaceIdsWithPendingUninstallHooks;
  }

  // The hook must run before the application deletion migration removes its
  // function metadata and code. Explicit application uninstall remains
  // best-effort so external cleanup cannot block removing the application.
  async runUninstallHookBestEffort({
    application,
    workspaceId,
  }: {
    application: ApplicationForUninstallHook;
    workspaceId: string;
  }): Promise<void> {
    try {
      await this.runUninstallHook({
        application,
        workspaceId,
        payload: { version: application.version ?? undefined },
      });
    } catch (error) {
      this.logger.warn(
        `Uninstall hook failed for application ${application.universalIdentifier}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async runUninstallHooksForWorkspaceRequest({
    workspaceId,
    workspaceUninstallHookRequest,
  }: {
    workspaceId: string;
    workspaceUninstallHookRequest: WorkspaceUninstallHookRequest;
  }): Promise<void> {
    const applications =
      await this.applicationService.findManyApplications(workspaceId);
    const pendingApplications = applications.filter((application) =>
      isApplicationUninstallHookPending(
        application,
        workspaceUninstallHookRequest.requestedAt,
      ),
    );
    const applicationUninstallHookFailures: string[] = [];

    for (const application of pendingApplications) {
      try {
        await this.runUninstallHookForWorkspaceRequest({
          application,
          workspaceId,
          workspaceUninstallHookRequest,
        });
        await this.applicationRepository.update(application.id, {
          uninstallHookCompletedForRequestedAt:
            workspaceUninstallHookRequest.requestedAt,
        });
      } catch (error) {
        const applicationUninstallHookFailure = `${application.universalIdentifier}: ${error instanceof Error ? error.message : String(error)}`;

        applicationUninstallHookFailures.push(applicationUninstallHookFailure);
        this.logger.warn(
          `${workspaceUninstallHookRequest.type} uninstall hook failed: ${applicationUninstallHookFailure}`,
        );
      }
    }

    if (applicationUninstallHookFailures.length > 0) {
      throw new ApplicationException(
        `Application uninstall hooks failed for workspace ${workspaceId}: ${applicationUninstallHookFailures.join('; ')}`,
        ApplicationExceptionCode.UNINSTALL_ERROR,
      );
    }
  }

  private async runUninstallHookForWorkspaceRequest({
    application,
    workspaceId,
    workspaceUninstallHookRequest,
  }: {
    application: ApplicationForUninstallHook;
    workspaceId: string;
    workspaceUninstallHookRequest: WorkspaceUninstallHookRequest;
  }): Promise<void> {
    await this.runUninstallHook({
      application,
      workspaceId,
      workspaceDeletionRequestTimestamp:
        workspaceUninstallHookRequest.type === 'workspace-deletion'
          ? workspaceUninstallHookRequest.requestedAt.toISOString()
          : undefined,
      payload: buildWorkspaceUninstallHookPayload({
        applicationVersion: application.version,
        applicationUniversalIdentifier: application.universalIdentifier,
        workspaceId,
        uninstallRequestedAt: workspaceUninstallHookRequest.requestedAt,
        workspaceUninstallHookRequestType: workspaceUninstallHookRequest.type,
      }),
    });
  }

  private async runUninstallHook({
    application,
    workspaceId,
    payload,
    workspaceDeletionRequestTimestamp,
  }: {
    application: ApplicationForUninstallHook;
    workspaceId: string;
    payload: UninstallHookPayload;
    workspaceDeletionRequestTimestamp?: string;
  }): Promise<void> {
    if (!isDefined(application.uninstallLogicFunctionId)) {
      return;
    }

    this.logger.log(
      `Executing uninstall hook for application ${application.universalIdentifier}`,
    );

    const logicFunctionExecutionResult =
      await this.logicFunctionExecutorService.execute({
        logicFunctionId: application.uninstallLogicFunctionId,
        workspaceId,
        payload,
        ...(isDefined(workspaceDeletionRequestTimestamp)
          ? { workspaceDeletionRequestTimestamp }
          : {}),
      });

    if (isDefined(logicFunctionExecutionResult.error)) {
      throw new ApplicationException(
        logicFunctionExecutionResult.error.errorMessage,
        ApplicationExceptionCode.UNINSTALL_ERROR,
      );
    }
  }
}
