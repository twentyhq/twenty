import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, type Repository } from 'typeorm';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import {
  buildWorkspaceUninstallHookPayload,
  type UninstallHookPayload,
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
    const applications =
      await this.applicationService.findManyApplications(workspaceId);
    const pendingApplications = applications.filter((application) =>
      isApplicationUninstallHookPending(application, workspaceDeletedAt),
    );
    const applicationUninstallHookFailures: string[] = [];

    for (const application of pendingApplications) {
      try {
        await this.runUninstallHookForWorkspaceDeletion({
          application,
          workspaceId,
          workspaceDeletedAt,
        });
        await this.applicationRepository.update(application.id, {
          uninstallHookCompletedForRequestedAt: workspaceDeletedAt,
        });
      } catch (error) {
        const applicationUninstallHookFailure = `${application.universalIdentifier}: ${error instanceof Error ? error.message : String(error)}`;

        applicationUninstallHookFailures.push(applicationUninstallHookFailure);
        this.logger.warn(
          `workspace-deletion uninstall hook failed: ${applicationUninstallHookFailure}`,
        );
      }
    }

    if (isNonEmptyArray(applicationUninstallHookFailures)) {
      throw new ApplicationException(
        `Application uninstall hooks failed for workspace ${workspaceId}: ${applicationUninstallHookFailures.join('; ')}`,
        ApplicationExceptionCode.UNINSTALL_ERROR,
      );
    }
  }

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
    if (!isNonEmptyArray(workspaceUninstallRequests)) {
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

  private async runUninstallHookForWorkspaceDeletion({
    application,
    workspaceId,
    workspaceDeletedAt,
  }: {
    application: ApplicationForUninstallHook;
    workspaceId: string;
    workspaceDeletedAt: Date;
  }): Promise<void> {
    await this.runUninstallHook({
      application,
      workspaceId,
      workspaceDeletionRequestTimestamp: workspaceDeletedAt.toISOString(),
      payload: buildWorkspaceUninstallHookPayload({
        applicationVersion: application.version,
        applicationUniversalIdentifier: application.universalIdentifier,
        workspaceId,
        uninstallRequestedAt: workspaceDeletedAt,
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
