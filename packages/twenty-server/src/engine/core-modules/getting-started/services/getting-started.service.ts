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
import {
  COMPANY_ENRICHMENT_KEY,
  type CompanyEnrichmentKeyValueTypeMap,
} from 'src/engine/core-modules/company-enrichment/types/company-enrichment-key-value.type';
import {
  PERSON_ENRICHMENT_KEY,
  type PersonEnrichmentKeyValueTypeMap,
} from 'src/engine/core-modules/company-enrichment/types/person-enrichment-key-value.type';
import { matchWorkspacePersonEnrichmentToUserEmail } from 'src/engine/core-modules/company-enrichment/utils/match-workspace-person-enrichment-to-user-email.util';
import { GETTING_STARTED_HIDDEN_USER_VAR_KEY } from 'src/engine/core-modules/getting-started/constants/getting-started-hidden-user-var-key.constant';
import { GETTING_STARTED_SELECTED_STEP_USER_VAR_KEY } from 'src/engine/core-modules/getting-started/constants/getting-started-selected-step-user-var-key.constant';
import { GETTING_STARTED_SNOOZED_UNTIL_USER_VAR_KEY } from 'src/engine/core-modules/getting-started/constants/getting-started-snoozed-until-user-var-key.constant';
import { GETTING_STARTED_STEP_DEFINITIONS } from 'src/engine/core-modules/getting-started/constants/getting-started-step-definitions.constant';
import { GETTING_STARTED_STEP_USER_VAR_KEY_PREFIX } from 'src/engine/core-modules/getting-started/constants/getting-started-step-user-var-key-prefix.constant';
import { GETTING_STARTED_STEPS_USER_VAR_KEY } from 'src/engine/core-modules/getting-started/constants/getting-started-steps-user-var-key.constant';
import { type CompleteGettingStartedStepInput } from 'src/engine/core-modules/getting-started/dtos/complete-getting-started-step.input';
import { type GettingStartedProgressDTO } from 'src/engine/core-modules/getting-started/dtos/getting-started-progress.dto';
import { type UpdateGettingStartedInput } from 'src/engine/core-modules/getting-started/dtos/update-getting-started.input';
import { GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';
import {
  GettingStartedException,
  GettingStartedExceptionCode,
} from 'src/engine/core-modules/getting-started/getting-started.exception';
import { type GettingStartedKeyValueTypeMap } from 'src/engine/core-modules/getting-started/types/getting-started-key-value-type-map.type';
import { type GettingStartedSelectionContext } from 'src/engine/core-modules/getting-started/types/getting-started-selection-context.type';
import { selectGettingStartedSteps } from 'src/engine/core-modules/getting-started/utils/select-getting-started-steps.util';
import { KeyValuePairType } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { KeyValuePairService } from 'src/engine/core-modules/key-value-pair/key-value-pair.service';
import { ONBOARDING_REWARD_IDEMPOTENCY_KEY_PREFIXES } from 'src/engine/core-modules/onboarding/constants/onboarding-reward-idempotency-key-prefixes';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { isWorkEmail } from 'src/utils/is-work-email';

type GettingStartedScope = {
  userId: string;
  userEmail: string;
  workspaceId: string;
  userWorkspaceId: string;
};

type WorkspaceEnrichmentKeyValueTypeMap = CompanyEnrichmentKeyValueTypeMap &
  PersonEnrichmentKeyValueTypeMap;

@Injectable()
export class GettingStartedService {
  constructor(
    private readonly userVarsService: UserVarsService<GettingStartedKeyValueTypeMap>,
    private readonly keyValuePairService: KeyValuePairService<WorkspaceEnrichmentKeyValueTypeMap>,
    private readonly billingService: BillingService,
    private readonly billingCreditGrantService: BillingCreditGrantService,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
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

    const savedSteps: GettingStartedKeyValueTypeMap[typeof GETTING_STARTED_STEPS_USER_VAR_KEY] =
      userVars.get(GETTING_STARTED_STEPS_USER_VAR_KEY) ??
      (await this.prepareSteps({
        userId,
        userEmail,
        workspaceId,
        userWorkspaceId,
      }));

    const steps = savedSteps.steps.filter((step) =>
      Object.values(GettingStartedStep).includes(step),
    );

    const completedSteps = steps.filter((step) =>
      isDefined(
        userVars.get(`${GETTING_STARTED_STEP_USER_VAR_KEY_PREFIX}${step}`),
      ),
    );

    const savedSelectedStep = userVars.get(
      GETTING_STARTED_SELECTED_STEP_USER_VAR_KEY,
    );
    const snoozedUntil = userVars.get(
      GETTING_STARTED_SNOOZED_UNTIL_USER_VAR_KEY,
    );

    return {
      creditsEarned,
      steps: steps.map((step) => ({
        key: step,
        kind: GETTING_STARTED_STEP_DEFINITIONS[step].kind,
        permissionFlag: GETTING_STARTED_STEP_DEFINITIONS[step].permissionFlag,
      })),
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

    return this.getProgress({
      userId,
      userEmail,
      workspaceId,
      userWorkspaceId,
    });
  }

  async completeStepFromClient({
    userId,
    userEmail,
    workspaceId,
    userWorkspaceId,
    input,
  }: GettingStartedScope & {
    input: CompleteGettingStartedStepInput;
  }): Promise<GettingStartedProgressDTO> {
    if (!GETTING_STARTED_STEP_DEFINITIONS[input.step].isClientCompletable) {
      throw new GettingStartedException(
        `Step ${input.step} can only be completed by the server`,
        GettingStartedExceptionCode.INVALID_STEP,
      );
    }

    await this.completeStep({
      userId,
      workspaceId,
      step: input.step,
      threadId: input.threadId ?? undefined,
    });

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
    threadId,
  }: {
    userId: string;
    workspaceId: string;
    step: GettingStartedStep;
    threadId?: string;
  }): Promise<void> {
    const key = `${GETTING_STARTED_STEP_USER_VAR_KEY_PREFIX}${step}` as const;

    const completion = await this.userVarsService.get({
      userId,
      workspaceId,
      key,
    });

    if (isDefined(completion)) {
      return;
    }

    await this.userVarsService.set({
      userId,
      workspaceId,
      key,
      value: { completedAt: new Date().toISOString(), threadId },
    });
  }

  private async prepareSteps({
    userId,
    userEmail,
    workspaceId,
    userWorkspaceId,
  }: GettingStartedScope) {
    const selectionContext = await this.buildSelectionContext({
      userEmail,
      workspaceId,
      userWorkspaceId,
    });

    await this.userVarsService.setIfNotExists({
      userId,
      workspaceId,
      key: GETTING_STARTED_STEPS_USER_VAR_KEY,
      value: {
        ...selectGettingStartedSteps(selectionContext),
        preparedAt: new Date().toISOString(),
      },
    });

    return this.userVarsService.get({
      userId,
      workspaceId,
      key: GETTING_STARTED_STEPS_USER_VAR_KEY,
    });
  }

  private async buildSelectionContext({
    userEmail,
    workspaceId,
    userWorkspaceId,
  }: Omit<
    GettingStartedScope,
    'userId'
  >): Promise<GettingStartedSelectionContext> {
    const [
      connectedAccounts,
      hasInstalledFeaturedApp,
      companyEnrichment,
      personEnrichment,
    ] = await Promise.all([
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
      this.findWorkspaceEnrichment({
        workspaceId,
        key: COMPANY_ENRICHMENT_KEY,
      }),
      this.findWorkspaceEnrichment({
        workspaceId,
        key: PERSON_ENRICHMENT_KEY,
      }),
    ]);

    return {
      isWorkEmail: isWorkEmail(userEmail),
      hasConnectedMailbox: connectedAccounts.some((connectedAccount) =>
        canConnectedAccountPerformEmailOperation({
          connectedAccount,
          operation: EmailOperation.DRAFT,
        }),
      ),
      hasInstalledFeaturedApp,
      companyEnrichment,
      personEnrichment: matchWorkspacePersonEnrichmentToUserEmail({
        personEnrichment,
        userEmail,
      }),
    };
  }

  private async findWorkspaceEnrichment<
    TKey extends keyof WorkspaceEnrichmentKeyValueTypeMap,
  >({
    workspaceId,
    key,
  }: {
    workspaceId: string;
    key: Extract<TKey, string>;
  }): Promise<WorkspaceEnrichmentKeyValueTypeMap[TKey] | null> {
    const [keyValuePair] = await this.keyValuePairService.get({
      userId: null,
      workspaceId,
      type: KeyValuePairType.CONFIG_VARIABLE,
      key,
    });

    return (
      (
        keyValuePair as
          | { value?: WorkspaceEnrichmentKeyValueTypeMap[TKey] }
          | undefined
      )?.value ?? null
    );
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
