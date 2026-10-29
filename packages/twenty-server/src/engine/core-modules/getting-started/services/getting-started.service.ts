import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { GETTING_STARTED_APP_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/application';
import { EmailOperation } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { GETTING_STARTED_STEP_REWARDS } from 'src/engine/core-modules/getting-started/constants/getting-started-step-rewards.constant';
import { type GettingStartedStepRewardDTO } from 'src/engine/core-modules/getting-started/dtos/getting-started-step-reward.dto';
import { type UpdateGettingStartedInput } from 'src/engine/core-modules/getting-started/dtos/update-getting-started.input';
import { GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';
import {
  GETTING_STARTED_HIDDEN_USER_VAR_KEY,
  GETTING_STARTED_SELECTED_STEP_USER_VAR_KEY,
  GETTING_STARTED_SNOOZED_UNTIL_USER_VAR_KEY,
  GETTING_STARTED_STEP_USER_VAR_KEY_PREFIX,
  GETTING_STARTED_WORKFLOW_USER_VAR_KEY_PREFIX,
  type GettingStartedKeyValueTypeMap,
} from 'src/engine/core-modules/getting-started/types/getting-started-key-value-type-map.type';
import { type GettingStartedProgress } from 'src/engine/core-modules/getting-started/types/getting-started-progress.type';
import { getGettingStartedSteps } from 'src/engine/core-modules/getting-started/utils/get-getting-started-steps.util';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import {
  WorkflowVersionEntity,
  WorkflowVersionStatus,
} from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

type GettingStartedScope = {
  userId: string;
  userEmail: string;
  workspaceId: string;
  userWorkspaceId: string;
};

type GettingStartedUserVars = Awaited<
  ReturnType<UserVarsService<GettingStartedKeyValueTypeMap>['getAll']>
>;

@Injectable()
export class GettingStartedService {
  constructor(
    private readonly userVarsService: UserVarsService<GettingStartedKeyValueTypeMap>,
    private readonly onboardingService: OnboardingService,
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
    private readonly permissionsService: PermissionsService,
    @InjectWorkspaceScopedRepository(ApplicationEntity)
    private readonly applicationRepository: WorkspaceScopedRepository<ApplicationEntity>,
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly workflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>,
  ) {}

  async getProgress({
    userId,
    userEmail,
    workspaceId,
    userWorkspaceId,
  }: GettingStartedScope): Promise<GettingStartedProgress> {
    const [
      userVars,
      creditsEarnedMicro,
      { permissionFlags },
      ownSendingMailbox,
    ] = await Promise.all([
      this.userVarsService.getAll({ userId, workspaceId }),
      this.onboardingService.sumEarnedRewardsMicro({
        workspaceId,
        rewards: Object.values(GETTING_STARTED_STEP_REWARDS).filter(isDefined),
      }),
      this.permissionsService.getUserWorkspacePermissions({
        userWorkspaceId,
        workspaceId,
      }),
      this.findOwnSendingMailbox({ workspaceId, userWorkspaceId }),
    ]);

    const steps = getGettingStartedSteps({
      userEmail,
      permissionFlags,
      hasSendingMailbox: isDefined(ownSendingMailbox),
    });

    const isSavedAsCompleted = (step: GettingStartedStep) =>
      isDefined(
        userVars.get(`${GETTING_STARTED_STEP_USER_VAR_KEY_PREFIX}${step}`),
      );

    const alreadyDoneSteps = await this.findAlreadyDoneSteps({
      workspaceId,
      userWorkspaceId,
      steps: steps.filter((step) => !isSavedAsCompleted(step)),
      userVars,
    });

    await Promise.all(
      alreadyDoneSteps.map((step) =>
        this.completeStep({ userId, workspaceId, step }),
      ),
    );

    const completedSteps = steps.filter(
      (step) => isSavedAsCompleted(step) || alreadyDoneSteps.includes(step),
    );

    const stepRewards = await this.findStepRewards({
      userId,
      workspaceId,
      openSteps: steps.filter((step) => !completedSteps.includes(step)),
    });

    const savedSelectedStep = userVars.get(
      GETTING_STARTED_SELECTED_STEP_USER_VAR_KEY,
    );
    const snoozedUntil = userVars.get(
      GETTING_STARTED_SNOOZED_UNTIL_USER_VAR_KEY,
    );

    return {
      creditsEarned: toDisplayCredits(creditsEarnedMicro),
      stepRewards,
      steps,
      completedSteps,
      selectedStep: steps.find((step) => step === savedSelectedStep) ?? null,
      snoozedUntil: isNonEmptyString(snoozedUntil) ? snoozedUntil : null,
      isHidden: userVars.get(GETTING_STARTED_HIDDEN_USER_VAR_KEY) === true,
    };
  }

  async updateProgress({
    userId,
    userEmail,
    workspaceId,
    userWorkspaceId,
    input,
  }: GettingStartedScope & {
    input: UpdateGettingStartedInput;
  }): Promise<GettingStartedProgress> {
    if (isDefined(input.selectedStep)) {
      await this.userVarsService.set({
        userId,
        workspaceId,
        key: GETTING_STARTED_SELECTED_STEP_USER_VAR_KEY,
        value: input.selectedStep,
      });
    }

    if (input.snoozedUntil !== undefined) {
      await this.userVarsService.set({
        userId,
        workspaceId,
        key: GETTING_STARTED_SNOOZED_UNTIL_USER_VAR_KEY,
        value: input.snoozedUntil,
      });
    }

    if (isDefined(input.isHidden)) {
      await this.userVarsService.set({
        userId,
        workspaceId,
        key: GETTING_STARTED_HIDDEN_USER_VAR_KEY,
        value: input.isHidden,
      });
    }

    if (isDefined(input.completedStep)) {
      await this.completeStep({
        userId,
        workspaceId,
        step: input.completedStep,
      });
    }

    return this.getProgress({
      userId,
      userEmail,
      workspaceId,
      userWorkspaceId,
    });
  }

  async completeStep({
    userId,
    workspaceId,
    step,
  }: {
    userId: string;
    workspaceId: string;
    step: GettingStartedStep;
  }): Promise<void> {
    await this.userVarsService.setIfNotExists({
      userId,
      workspaceId,
      key: `${GETTING_STARTED_STEP_USER_VAR_KEY_PREFIX}${step}`,
      value: { completedAt: new Date().toISOString() },
    });
  }

  private async findStepRewards({
    userId,
    workspaceId,
    openSteps,
  }: {
    userId: string;
    workspaceId: string;
    openSteps: GettingStartedStep[];
  }): Promise<GettingStartedStepRewardDTO[]> {
    const stepRewards = await Promise.all(
      openSteps.map(async (step) => {
        const reward = GETTING_STARTED_STEP_REWARDS[step];

        if (!isDefined(reward)) {
          return null;
        }

        const grantableReward =
          await this.onboardingService.findGrantableReward({
            reward,
            userId,
            workspaceId,
          });

        if (!isDefined(grantableReward)) {
          return null;
        }

        return {
          step,
          creditsEach: toDisplayCredits(grantableReward.amountMicro),
          remainingCount: grantableReward.remainingCount,
        };
      }),
    );

    return stepRewards.filter(isDefined);
  }

  private async findAlreadyDoneSteps({
    workspaceId,
    userWorkspaceId,
    steps,
    userVars,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    steps: GettingStartedStep[];
    userVars: GettingStartedUserVars;
  }): Promise<GettingStartedStep[]> {
    const [
      hasConnectedMailbox,
      hasInstalledFeaturedApp,
      stepsWithActiveWorkflow,
    ] = await Promise.all([
      steps.includes(GettingStartedStep.CONNECT_MAILBOX)
        ? this.hasOwnDraftingMailbox({ workspaceId, userWorkspaceId })
        : false,
      steps.includes(GettingStartedStep.INSTALL_APP)
        ? this.hasInstalledFeaturedApp(workspaceId)
        : false,
      this.findStepsWithActiveWorkflow({ workspaceId, steps, userVars }),
    ]);

    return steps.filter((step) => {
      switch (step) {
        case GettingStartedStep.CONNECT_MAILBOX:
          return hasConnectedMailbox;
        case GettingStartedStep.INSTALL_APP:
          return hasInstalledFeaturedApp;
        default:
          return stepsWithActiveWorkflow.includes(step);
      }
    });
  }

  private async findStepsWithActiveWorkflow({
    workspaceId,
    steps,
    userVars,
  }: {
    workspaceId: string;
    steps: GettingStartedStep[];
    userVars: GettingStartedUserVars;
  }): Promise<GettingStartedStep[]> {
    const savedWorkflows = steps.flatMap((step) => {
      const savedWorkflow = userVars.get(
        `${GETTING_STARTED_WORKFLOW_USER_VAR_KEY_PREFIX}${step}`,
      );

      return isDefined(savedWorkflow)
        ? [{ step, workflowId: savedWorkflow.workflowId }]
        : [];
    });

    if (!isNonEmptyArray(savedWorkflows)) {
      return [];
    }

    const activeVersions = await this.workflowVersionRepository.find(
      workspaceId,
      {
        select: { coreWorkflowId: true },
        where: {
          coreWorkflowId: In(
            savedWorkflows.map(({ workflowId }) => workflowId),
          ),
          status: WorkflowVersionStatus.ACTIVE,
        },
      },
    );

    const activeWorkflowIds = activeVersions.map(
      (activeVersion) => activeVersion.coreWorkflowId,
    );

    return savedWorkflows
      .filter(({ workflowId }) => activeWorkflowIds.includes(workflowId))
      .map(({ step }) => step);
  }

  private async findOwnSendingMailbox({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }) {
    const mailboxes =
      await this.connectedAccountMetadataService.findMailboxesUsableByCaller({
        workspaceId,
        userWorkspaceId,
        operation: EmailOperation.SEND,
      });

    return mailboxes.find((mailbox) => mailbox.scope === 'USER');
  }

  private async hasOwnDraftingMailbox({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<boolean> {
    const mailboxes =
      await this.connectedAccountMetadataService.findMailboxesUsableByCaller({
        workspaceId,
        userWorkspaceId,
        operation: EmailOperation.DRAFT,
      });

    return mailboxes.some(
      (mailbox) => mailbox.userWorkspaceId === userWorkspaceId,
    );
  }

  private hasInstalledFeaturedApp(workspaceId: string): Promise<boolean> {
    return this.applicationRepository.exists(workspaceId, {
      where: {
        universalIdentifier: In(GETTING_STARTED_APP_UNIVERSAL_IDENTIFIERS),
      },
    });
  }
}
