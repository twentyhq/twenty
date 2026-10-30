import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { GETTING_STARTED_APP_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/application';
import { EmailOperation } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';
import { In } from 'typeorm';

import { MarketplaceQueryService } from 'src/engine/core-modules/application/application-marketplace/marketplace-query.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  COMPANY_ENRICHMENT_ATTEMPT_KEY,
  type CompanyEnrichmentAttemptKeyValueTypeMap,
} from 'src/engine/core-modules/company-enrichment/types/company-enrichment-attempt-key-value.type';
import {
  COMPANY_ENRICHMENT_KEY,
  type CompanyEnrichmentKeyValueTypeMap,
} from 'src/engine/core-modules/company-enrichment/types/company-enrichment-key-value.type';
import { type UpdateGettingStartedInput } from 'src/engine/core-modules/getting-started/dtos/update-getting-started.input';
import { GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';
import {
  GETTING_STARTED_HIDDEN_USER_VAR_KEY,
  GETTING_STARTED_PROFILE_USER_VAR_KEY,
  GETTING_STARTED_SELECTED_STEP_USER_VAR_KEY,
  GETTING_STARTED_SNOOZED_UNTIL_USER_VAR_KEY,
  GETTING_STARTED_STEP_USER_VAR_KEY_PREFIX,
  type GettingStartedKeyValueTypeMap,
} from 'src/engine/core-modules/getting-started/types/getting-started-key-value-type-map.type';
import { type GettingStartedProfile } from 'src/engine/core-modules/getting-started/types/getting-started-profile.type';
import { type GettingStartedProgress } from 'src/engine/core-modules/getting-started/types/getting-started-progress.type';
import { getGettingStartedProfile } from 'src/engine/core-modules/getting-started/utils/get-getting-started-profile.util';
import { getGettingStartedSteps } from 'src/engine/core-modules/getting-started/utils/get-getting-started-steps.util';
import { KeyValuePairType } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { KeyValuePairService } from 'src/engine/core-modules/key-value-pair/key-value-pair.service';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

type WorkspaceEnrichmentKeyValueTypeMap = CompanyEnrichmentKeyValueTypeMap &
  CompanyEnrichmentAttemptKeyValueTypeMap;

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
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
    private readonly permissionsService: PermissionsService,
    private readonly marketplaceQueryService: MarketplaceQueryService,
    private readonly keyValuePairService: KeyValuePairService<WorkspaceEnrichmentKeyValueTypeMap>,
    @InjectWorkspaceScopedRepository(ApplicationEntity)
    private readonly applicationRepository: WorkspaceScopedRepository<ApplicationEntity>,
  ) {}

  async getProgress({
    userId,
    userEmail,
    workspaceId,
    userWorkspaceId,
  }: GettingStartedScope): Promise<GettingStartedProgress> {
    const [
      userVars,
      { permissionFlags },
      ownSendingMailbox,
      companyEnrichment,
      companyEnrichmentAttempt,
      featuredApps,
    ] = await Promise.all([
      this.userVarsService.getAll({ userId, workspaceId }),
      this.permissionsService.getUserWorkspacePermissions({
        userWorkspaceId,
        workspaceId,
      }),
      this.findOwnSendingMailbox({ workspaceId, userWorkspaceId }),
      this.findWorkspaceConfigVariable({
        workspaceId,
        key: COMPANY_ENRICHMENT_KEY,
      }),
      this.findWorkspaceConfigVariable({
        workspaceId,
        key: COMPANY_ENRICHMENT_ATTEMPT_KEY,
      }),
      this.marketplaceQueryService.findManyMarketplaceApps({
        universalIdentifiers: [...GETTING_STARTED_APP_UNIVERSAL_IDENTIFIERS],
      }),
    ]);

    const profile = await this.getProfile({
      userId,
      userEmail,
      workspaceId,
      savedProfile: userVars.get(GETTING_STARTED_PROFILE_USER_VAR_KEY),
      companyEnrichment: companyEnrichment ?? null,
      hasCompanyEnrichmentAttempt: isDefined(companyEnrichmentAttempt),
    });

    const steps = getGettingStartedSteps({
      profile,
      permissionFlags,
      hasSendingMailbox: isDefined(ownSendingMailbox),
      hasFeaturedApp: isNonEmptyArray(featuredApps),
    });

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
      steps,
      companyEnrichment: companyEnrichment ?? null,
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

  // Enrichment can land after the first visit, so the profile is saved once
  // it can no longer change and the step list stays stable.
  private async getProfile({
    userId,
    userEmail,
    workspaceId,
    savedProfile,
    companyEnrichment,
    hasCompanyEnrichmentAttempt,
  }: {
    userId: string;
    userEmail: string;
    workspaceId: string;
    savedProfile: GettingStartedProfile | undefined;
    companyEnrichment: WorkspaceCompanyEnrichment | null;
    hasCompanyEnrichmentAttempt: boolean;
  }): Promise<GettingStartedProfile> {
    if (isDefined(savedProfile)) {
      return savedProfile;
    }

    const profile = getGettingStartedProfile({ userEmail, companyEnrichment });

    if (profile === 'PERSONAL' || hasCompanyEnrichmentAttempt) {
      await this.userVarsService.setIfNotExists({
        userId,
        workspaceId,
        key: GETTING_STARTED_PROFILE_USER_VAR_KEY,
        value: profile,
      });
    }

    return profile;
  }

  private async findWorkspaceConfigVariable<
    TKey extends keyof WorkspaceEnrichmentKeyValueTypeMap,
  >({
    workspaceId,
    key,
  }: {
    workspaceId: string;
    key: Extract<TKey, string>;
  }): Promise<WorkspaceEnrichmentKeyValueTypeMap[TKey] | undefined> {
    const [keyValuePair] = (await this.keyValuePairService.get<TKey>({
      userId: null,
      workspaceId,
      type: KeyValuePairType.CONFIG_VARIABLE,
      key,
    })) as { value?: WorkspaceEnrichmentKeyValueTypeMap[TKey] }[];

    return keyValuePair?.value;
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
        ? this.hasOwnDraftingMailbox({ workspaceId, userWorkspaceId })
        : false,
      steps.includes(GettingStartedStep.INSTALL_APP)
        ? this.hasInstalledFeaturedApp(workspaceId)
        : false,
    ]);

    return steps.filter(
      (step) =>
        (step === GettingStartedStep.CONNECT_MAILBOX && hasConnectedMailbox) ||
        (step === GettingStartedStep.INSTALL_APP && hasInstalledFeaturedApp),
    );
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
