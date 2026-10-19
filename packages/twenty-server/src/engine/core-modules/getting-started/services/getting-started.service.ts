import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { GETTING_STARTED_APP_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/application';
import { EmailOperation } from 'twenty-shared/types';
import {
  canConnectedAccountPerformEmailOperation,
  getEmailProvidersForOperation,
  isDefined,
} from 'twenty-shared/utils';
import { In, IsNull, Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { BillingCreditGrantService } from 'src/engine/core-modules/billing/services/billing-credit-grant.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { GETTING_STARTED_COMPLETED_USER_VAR_KEY_PREFIX } from 'src/engine/core-modules/getting-started/constants/getting-started-completed-user-var-key-prefix.constant';
import { GETTING_STARTED_SELECTED_STEP_USER_VAR_KEY } from 'src/engine/core-modules/getting-started/constants/getting-started-selected-step-user-var-key.constant';
import { GETTING_STARTED_SNOOZED_UNTIL_USER_VAR_KEY } from 'src/engine/core-modules/getting-started/constants/getting-started-snoozed-until-user-var-key.constant';
import { type GettingStartedProgressDTO } from 'src/engine/core-modules/getting-started/dtos/getting-started-progress.dto';
import { type UpdateGettingStartedInput } from 'src/engine/core-modules/getting-started/dtos/update-getting-started.input';
import { GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';
import { type GettingStartedKeyValueTypeMap } from 'src/engine/core-modules/getting-started/types/getting-started-key-value-type-map.type';
import { ONBOARDING_REWARD_IDEMPOTENCY_KEY_PREFIXES } from 'src/engine/core-modules/onboarding/constants/onboarding-reward-idempotency-key-prefixes';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

type GettingStartedScope = {
  userId: string;
  workspaceId: string;
  userWorkspaceId: string;
};

@Injectable()
export class GettingStartedService {
  constructor(
    private readonly userVarsService: UserVarsService<GettingStartedKeyValueTypeMap>,
    private readonly billingService: BillingService,
    private readonly billingCreditGrantService: BillingCreditGrantService,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectWorkspaceScopedRepository(ApplicationEntity)
    private readonly applicationRepository: WorkspaceScopedRepository<ApplicationEntity>,
  ) {}

  async getProgress({
    userId,
    workspaceId,
    userWorkspaceId,
  }: GettingStartedScope): Promise<GettingStartedProgressDTO> {
    const [userVars, connectedAccounts, hasInstalledApp, creditsEarned] =
      await Promise.all([
        this.userVarsService.getAll({ userId, workspaceId }),
        this.connectedAccountRepository.find({
          where: {
            workspaceId,
            userWorkspaceId,
            provider: In(getEmailProvidersForOperation(EmailOperation.DRAFT)),
            archivedAt: IsNull(),
          },
          select: { provider: true, connectionParameters: true },
        }),
        this.applicationRepository.exists(workspaceId, {
          where: {
            universalIdentifier: In(GETTING_STARTED_APP_UNIVERSAL_IDENTIFIERS),
          },
        }),
        this.getCreditsEarned(workspaceId),
      ]);

    const hasConnectedMailbox = connectedAccounts.some((connectedAccount) =>
      canConnectedAccountPerformEmailOperation({
        connectedAccount,
        operation: EmailOperation.DRAFT,
      }),
    );

    const completedSteps = Object.values(GettingStartedStep).filter((step) => {
      switch (step) {
        case GettingStartedStep.CONNECT_MAILBOX:
          return hasConnectedMailbox;
        case GettingStartedStep.INSTALL_APP:
          return hasInstalledApp;
        default:
          return (
            userVars.get(
              `${GETTING_STARTED_COMPLETED_USER_VAR_KEY_PREFIX}.${step}`,
            ) === true
          );
      }
    });

    const savedSelectedStep = userVars.get(
      GETTING_STARTED_SELECTED_STEP_USER_VAR_KEY,
    );
    const snoozedUntil = userVars.get(
      GETTING_STARTED_SNOOZED_UNTIL_USER_VAR_KEY,
    );

    return {
      creditsEarned,
      completedSteps,
      selectedStep:
        Object.values(GettingStartedStep).find(
          (step) => step === savedSelectedStep,
        ) ?? null,
      snoozedUntil: typeof snoozedUntil === 'string' ? snoozedUntil : null,
    };
  }

  async updateProgress({
    userId,
    workspaceId,
    userWorkspaceId,
    input,
  }: GettingStartedScope & {
    input: UpdateGettingStartedInput;
  }): Promise<GettingStartedProgressDTO> {
    if (isDefined(input.completedStep)) {
      await this.completeStep({
        userId,
        workspaceId,
        step: input.completedStep,
      });
    }

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

    return this.getProgress({ userId, workspaceId, userWorkspaceId });
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
    await this.userVarsService.set({
      userId,
      workspaceId,
      key: `${GETTING_STARTED_COMPLETED_USER_VAR_KEY_PREFIX}.${step}`,
      value: true,
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
