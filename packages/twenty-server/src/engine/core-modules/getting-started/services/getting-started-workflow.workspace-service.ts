import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { GETTING_STARTED_WORKFLOW_BUILDERS } from 'src/engine/core-modules/getting-started/constants/getting-started-workflow-builders.constant';
import { type GettingStartedWorkflowDTO } from 'src/engine/core-modules/getting-started/dtos/getting-started-workflow.dto';
import { type GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';
import {
  GettingStartedException,
  GettingStartedExceptionCode,
} from 'src/engine/core-modules/getting-started/getting-started.exception';
import { GettingStartedService } from 'src/engine/core-modules/getting-started/services/getting-started.service';
import {
  GETTING_STARTED_WORKFLOW_USER_VAR_KEY_PREFIX,
  type GettingStartedKeyValueTypeMap,
} from 'src/engine/core-modules/getting-started/types/getting-started-key-value-type-map.type';
import { type GettingStartedWorkflowBuilder } from 'src/engine/core-modules/getting-started/types/getting-started-workflow-builder.type';
import { getWorkflowStepConnectedAccountIds } from 'src/engine/core-modules/getting-started/utils/get-workflow-step-connected-account-ids.util';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { WorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowStatus } from 'src/engine/core-modules/workflow/enums/workflow-status.enum';
import { CoreWorkflowLifecycleWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-lifecycle.workspace-service';
import { CoreWorkflowListService } from 'src/engine/core-modules/workflow/services/core-workflow-list.service';
import { CoreWorkflowMutationWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-mutation.workspace-service';
import { CoreWorkflowVersionListService } from 'src/engine/core-modules/workflow/services/core-workflow-version-list.service';
import { CoreWorkflowVersionMutationWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-version-mutation.workspace-service';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

@Injectable()
export class GettingStartedWorkflowWorkspaceService {
  constructor(
    private readonly userVarsService: UserVarsService<GettingStartedKeyValueTypeMap>,
    private readonly cacheLockService: CacheLockService,
    private readonly coreWorkflowListService: CoreWorkflowListService,
    private readonly coreWorkflowMutationWorkspaceService: CoreWorkflowMutationWorkspaceService,
    private readonly coreWorkflowLifecycleWorkspaceService: CoreWorkflowLifecycleWorkspaceService,
    private readonly coreWorkflowVersionListService: CoreWorkflowVersionListService,
    private readonly coreWorkflowVersionMutationWorkspaceService: CoreWorkflowVersionMutationWorkspaceService,
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly gettingStartedService: GettingStartedService,
  ) {}

  async prepareWorkflow({
    userId,
    workspaceId,
    userWorkspaceId,
    step,
    activate,
  }: {
    userId: string;
    workspaceId: string;
    userWorkspaceId: string;
    step: GettingStartedStep;
    activate: boolean;
  }): Promise<GettingStartedWorkflowDTO> {
    const buildWorkflow = GETTING_STARTED_WORKFLOW_BUILDERS[step];

    if (!isDefined(buildWorkflow)) {
      throw new GettingStartedException(
        `Step ${step} has no workflow`,
        GettingStartedExceptionCode.INVALID_STEP,
      );
    }

    return this.cacheLockService.withLock(
      async () => {
        const savedWorkflow = await this.userVarsService.get({
          workspaceId,
          key: `${GETTING_STARTED_WORKFLOW_USER_VAR_KEY_PREFIX}${step}`,
        });

        const savedCoreWorkflow = isDefined(savedWorkflow)
          ? await this.coreWorkflowListService.findOneById({
              workspaceId,
              userWorkspaceId,
              coreWorkflowId: savedWorkflow.workflowId,
            })
          : null;

        const workflow = isDefined(savedCoreWorkflow)
          ? savedWorkflow
          : await this.createWorkflowDraft({
              workspaceId,
              userWorkspaceId,
              step,
              buildWorkflow,
            });

        if (!activate) {
          return workflow;
        }

        const isWorkflowActive =
          savedCoreWorkflow?.statuses.includes(WorkflowStatus.ACTIVE) ?? false;

        if (!isWorkflowActive) {
          await this.fillEmptySendersAndAssertAccountsOrThrow({
            workspaceId,
            userWorkspaceId,
            coreWorkflowVersionId: workflow.versionId,
          });

          await this.coreWorkflowLifecycleWorkspaceService.activateCoreWorkflowVersion(
            {
              workspaceId,
              userWorkspaceId,
              coreWorkflowVersionId: workflow.versionId,
            },
          );
        }

        await this.gettingStartedService.completeStep({
          userId,
          workspaceId,
          step,
        });

        return workflow;
      },
      `getting-started-workflow:${workspaceId}:${step}`,
      { ttl: 30_000 },
    );
  }

  // The shared draft has no sender, so whoever turns it on sends from their own
  // mailbox, and must be allowed to use every account the draft acts from
  private async fillEmptySendersAndAssertAccountsOrThrow({
    workspaceId,
    userWorkspaceId,
    coreWorkflowVersionId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    coreWorkflowVersionId: string;
  }): Promise<void> {
    const [coreWorkflowVersion, usableConnectedAccounts] = await Promise.all([
      this.coreWorkflowVersionListService.findOneByCoreWorkflowVersionId({
        workspaceId,
        userWorkspaceId,
        coreWorkflowVersionId,
      }),
      this.connectedAccountMetadataService.findUsableByCaller({
        workspaceId,
        userWorkspaceId,
      }),
    ]);

    const steps = coreWorkflowVersion?.steps ?? [];
    const filledEmailSteps = await this.fillEmptyEmailSendersOrThrow({
      workspaceId,
      userWorkspaceId,
      steps,
    });

    const usableConnectedAccountIds = usableConnectedAccounts.map(
      (connectedAccount) => connectedAccount.id,
    );

    const hasConnectedAccountNotUsableByCaller =
      getWorkflowStepConnectedAccountIds({
        steps: steps.map(
          (step) =>
            filledEmailSteps.find(
              (filledEmailStep) => filledEmailStep.id === step.id,
            ) ?? step,
        ),
      }).some(
        (connectedAccountId) =>
          !usableConnectedAccountIds.includes(connectedAccountId),
      );

    if (hasConnectedAccountNotUsableByCaller) {
      throw new GettingStartedException(
        `Workflow version ${coreWorkflowVersionId} uses a connected account user workspace ${userWorkspaceId} cannot use`,
        GettingStartedExceptionCode.MAILBOX_NOT_USABLE,
      );
    }

    if (
      isNonEmptyArray(filledEmailSteps) &&
      coreWorkflowVersion?.status !== WorkflowVersionStatus.DRAFT
    ) {
      throw new GettingStartedException(
        `Workflow version ${coreWorkflowVersionId} has an email step without a sender and is not a draft`,
        GettingStartedExceptionCode.MAILBOX_NOT_USABLE,
      );
    }

    // Each update rewrites the version's steps, so they run one at a time
    for (const filledEmailStep of filledEmailSteps) {
      await this.coreWorkflowVersionMutationWorkspaceService.updateStep({
        workspaceId,
        userWorkspaceId,
        coreWorkflowVersionId,
        step: filledEmailStep,
      });
    }
  }

  private async fillEmptyEmailSendersOrThrow({
    workspaceId,
    userWorkspaceId,
    steps,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    steps: WorkflowAction[];
  }): Promise<WorkflowAction[]> {
    const emailStepsWithoutSender = steps.flatMap((step) =>
      (step.type === WorkflowActionType.SEND_EMAIL ||
        step.type === WorkflowActionType.DRAFT_EMAIL) &&
      !isNonEmptyString(step.settings.input.connectedAccountId)
        ? [step]
        : [],
    );

    if (!isNonEmptyArray(emailStepsWithoutSender)) {
      return [];
    }

    const mailbox = await this.gettingStartedService.findOwnSendingMailbox({
      workspaceId,
      userWorkspaceId,
    });

    if (!isDefined(mailbox)) {
      throw new GettingStartedException(
        `No mailbox can send the workflow emails for user workspace ${userWorkspaceId}`,
        GettingStartedExceptionCode.MAILBOX_NOT_CONNECTED,
      );
    }

    return emailStepsWithoutSender.map((emailStep) => ({
      ...emailStep,
      settings: {
        ...emailStep.settings,
        input: { ...emailStep.settings.input, connectedAccountId: mailbox.id },
      },
    }));
  }

  private async createWorkflowDraft({
    workspaceId,
    userWorkspaceId,
    step,
    buildWorkflow,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    step: GettingStartedStep;
    buildWorkflow: GettingStartedWorkflowBuilder;
  }): Promise<GettingStartedWorkflowDTO> {
    const { flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFieldMetadataMaps'],
        },
      );

    const { coreWorkflow, coreWorkflowVersionId } =
      await this.coreWorkflowMutationWorkspaceService.createWorkflowWithContent(
        {
          workspaceId,
          userWorkspaceId,
          ...buildWorkflow({ flatFieldMetadataMaps }),
        },
      );

    const workflow = {
      workflowId: coreWorkflow.id,
      versionId: coreWorkflowVersionId,
    };

    await this.userVarsService.set({
      workspaceId,
      key: `${GETTING_STARTED_WORKFLOW_USER_VAR_KEY_PREFIX}${step}`,
      value: workflow,
    });

    return workflow;
  }
}
