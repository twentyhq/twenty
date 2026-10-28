import { Injectable } from '@nestjs/common';

import { GETTING_STARTED_APP_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/application';
import { EmailOperation } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { BillingCreditGrantService } from 'src/engine/core-modules/billing/services/billing-credit-grant.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { GETTING_STARTED_TEAM_STEPS } from 'src/engine/core-modules/getting-started/constants/getting-started-team-steps.constant';
import { type GettingStartedProgressDTO } from 'src/engine/core-modules/getting-started/dtos/getting-started-progress.dto';
import { type UpdateGettingStartedInput } from 'src/engine/core-modules/getting-started/dtos/update-getting-started.input';
import { GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';
import {
  GETTING_STARTED_HIDDEN_USER_VAR_KEY,
  GETTING_STARTED_SELECTED_STEP_USER_VAR_KEY,
  GETTING_STARTED_SNOOZED_UNTIL_USER_VAR_KEY,
  GETTING_STARTED_STEP_USER_VAR_KEY_PREFIX,
  type GettingStartedKeyValueTypeMap,
} from 'src/engine/core-modules/getting-started/types/getting-started-key-value-type-map.type';
import { ONBOARDING_REWARD_IDEMPOTENCY_KEY_PREFIXES } from 'src/engine/core-modules/onboarding/constants/onboarding-reward-idempotency-key-prefixes';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { isWorkEmail } from 'src/utils/is-work-email';

type GettingStartedScope = {
  userId: string;
  userEmail: string;
  workspaceId: string;
  userWorkspaceId: string;
};

@Injectable()
export class GettingStartedService {
  constructor(
    private readonly userVarsService: UserVarsService<GettingStartedKeyValueTypeMap>,
    private readonly billingService: BillingService,
    private readonly billingCreditGrantService: BillingCreditGrantService,
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
    @InjectWorkspaceScopedRepository(ApplicationEntity)
    private readonly applicationRepository: WorkspaceScopedRepository<ApplicationEntity>,
  ) {}

  async getProgress({
    userId,
    userEmail,
    workspaceId,
    userWorkspaceId,
  }: GettingStartedScope): Promise<GettingStartedProgressDTO> {
    const [userVars, creditsEarned] = await Promise.all([
      this.userVarsService.getAll({ userId, workspaceId }),
      this.getCreditsEarned(workspaceId),
    ]);

    const steps = Object.values(GettingStartedStep).filter(
      (step) =>
        isWorkEmail(userEmail) || !GETTING_STARTED_TEAM_STEPS.includes(step),
    );

    const isSavedAsCompleted = (step: GettingStartedStep) =>
      isDefined(
        userVars.get(`${GETTING_STARTED_STEP_USER_VAR_KEY_PREFIX}${step}`),
      );

    const alreadyDoneSteps = await this.findAlreadyDoneSteps({
      workspaceId,
      userWorkspaceId,
      steps: steps.filter((step) => !isSavedAsCompleted(step)),
    });

    await Promise.all(
      alreadyDoneSteps.map((step) =>
        this.completeStep({ userId, workspaceId, step }),
      ),
    );

    const completedSteps = steps.filter(
      (step) => isSavedAsCompleted(step) || alreadyDoneSteps.includes(step),
    );

    const savedSelectedStep = userVars.get(
      GETTING_STARTED_SELECTED_STEP_USER_VAR_KEY,
    );
    const snoozedUntil = userVars.get(
      GETTING_STARTED_SNOOZED_UNTIL_USER_VAR_KEY,
    );

    return {
      creditsEarned,
      steps,
      completedSteps,
      selectedStep: steps.find((step) => step === savedSelectedStep) ?? null,
      snoozedUntil: typeof snoozedUntil === 'string' ? snoozedUntil : null,
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
  }): Promise<GettingStartedProgressDTO> {
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

  private async findAlreadyDoneSteps({
    workspaceId,
    userWorkspaceId,
    steps,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    steps: GettingStartedStep[];
  }): Promise<GettingStartedStep[]> {
    const [hasConnectedMailbox, hasInstalledFeaturedApp] = await Promise.all([
      steps.includes(GettingStartedStep.CONNECT_MAILBOX)
        ? this.hasConnectedMailbox({ workspaceId, userWorkspaceId })
        : false,
      steps.includes(GettingStartedStep.INSTALL_APP)
        ? this.hasInstalledFeaturedApp(workspaceId)
        : false,
    ]);

    return steps.filter((step) => {
      switch (step) {
        case GettingStartedStep.CONNECT_MAILBOX:
          return hasConnectedMailbox;
        case GettingStartedStep.INSTALL_APP:
          return hasInstalledFeaturedApp;
        default:
          return false;
      }
    });
  }

  private async hasConnectedMailbox({
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

  private async getCreditsEarned(workspaceId: string): Promise<number> {
    if (!this.billingService.isBillingEnabled()) {
      return 0;
    }

    const creditsEarnedMicro =
      await this.billingCreditGrantService.sumGrantsMicroByIdempotencyKeyPrefixes(
        {
          workspaceId,
          type: BillingCreditGrantType.ONBOARDING_REWARD,
          idempotencyKeyPrefixes: [
            `${ONBOARDING_REWARD_IDEMPOTENCY_KEY_PREFIXES.importContacts}:${workspaceId}`,
            `${ONBOARDING_REWARD_IDEMPOTENCY_KEY_PREFIXES.inviteTeam}:${workspaceId}:`,
          ],
        },
      );

    return toDisplayCredits(creditsEarnedMicro);
  }
}
