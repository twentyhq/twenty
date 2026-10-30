import { Injectable } from '@nestjs/common';

import { isNonEmptyString, isUndefined } from '@sniptt/guards';
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
import { GETTING_STARTED_STEP_ACTION_KEYS_BY_PROFILE } from 'src/engine/core-modules/getting-started/constants/getting-started-step-action-keys-by-profile.constant';
import { type UpdateGettingStartedInput } from 'src/engine/core-modules/getting-started/dtos/update-getting-started.input';
import { GettingStartedStepActionKey } from 'src/engine/core-modules/getting-started/enums/getting-started-step-action-key.enum';
import {
  GETTING_STARTED_COMPLETED_STEP_USER_VAR_KEY_PREFIX,
  GETTING_STARTED_HIDDEN_USER_VAR_KEY,
  GETTING_STARTED_SELECTED_STEP_USER_VAR_KEY,
  GETTING_STARTED_SNOOZED_UNTIL_USER_VAR_KEY,
  GETTING_STARTED_STEP_ACTION_KEYS_USER_VAR_KEY,
  type GettingStartedKeyValueTypeMap,
} from 'src/engine/core-modules/getting-started/types/getting-started-key-value-type-map.type';
import { type GettingStartedProgress } from 'src/engine/core-modules/getting-started/types/getting-started-progress.type';
import { filterGettingStartedStepActionKeys } from 'src/engine/core-modules/getting-started/utils/filter-getting-started-step-action-keys.util';
import { getGettingStartedProfile } from 'src/engine/core-modules/getting-started/utils/get-getting-started-profile.util';
import { isCompanyEnrichmentFinal } from 'src/engine/core-modules/getting-started/utils/is-company-enrichment-final.util';
import { isGettingStartedStepActionKey } from 'src/engine/core-modules/getting-started/utils/is-getting-started-step-action-key.util';
import { KeyValuePairType } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { KeyValuePairService } from 'src/engine/core-modules/key-value-pair/key-value-pair.service';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

type WorkspaceEnrichmentKeyValueTypeMap = CompanyEnrichmentKeyValueTypeMap &
  CompanyEnrichmentAttemptKeyValueTypeMap;

type CompanyEnrichmentAttempt =
  CompanyEnrichmentAttemptKeyValueTypeMap[typeof COMPANY_ENRICHMENT_ATTEMPT_KEY];

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
        isListed: true,
      }),
    ]);

    const assignedStepActionKeys = await this.getOrSaveAssignedStepActionKeys({
      userId,
      userEmail,
      workspaceId,
      savedStepActionKeys: userVars.get(
        GETTING_STARTED_STEP_ACTION_KEYS_USER_VAR_KEY,
      ),
      companyEnrichment: companyEnrichment ?? null,
      companyEnrichmentAttempt: companyEnrichmentAttempt ?? null,
    });

    const stepActionKeys = filterGettingStartedStepActionKeys({
      stepActionKeys: assignedStepActionKeys,
      permissionFlags,
      hasSendingMailbox: isDefined(ownSendingMailbox),
      hasFeaturedApp: isNonEmptyArray(featuredApps),
    });

    const isSavedAsCompleted = (stepActionKey: GettingStartedStepActionKey) =>
      isDefined(
        userVars.get(
          `${GETTING_STARTED_COMPLETED_STEP_USER_VAR_KEY_PREFIX}${stepActionKey}`,
        ),
      );

    const alreadyDoneStepActionKeys = await this.findAlreadyDoneStepActionKeys({
      workspaceId,
      userWorkspaceId,
      stepActionKeys: stepActionKeys.filter(
        (stepActionKey) => !isSavedAsCompleted(stepActionKey),
      ),
    });

    await Promise.all(
      alreadyDoneStepActionKeys.map((stepActionKey) =>
        this.completeStep({ userId, workspaceId, stepActionKey }),
      ),
    );

    const completedStepActionKeys = stepActionKeys.filter(
      (stepActionKey) =>
        isSavedAsCompleted(stepActionKey) ||
        alreadyDoneStepActionKeys.includes(stepActionKey),
    );

    const savedSelectedStepActionKey = userVars.get(
      GETTING_STARTED_SELECTED_STEP_USER_VAR_KEY,
    );
    const snoozedUntil = userVars.get(
      GETTING_STARTED_SNOOZED_UNTIL_USER_VAR_KEY,
    );

    return {
      stepActionKeys,
      companyEnrichment: companyEnrichment ?? null,
      completedStepActionKeys,
      selectedStepActionKey:
        stepActionKeys.find(
          (stepActionKey) => stepActionKey === savedSelectedStepActionKey,
        ) ?? null,
      snoozedUntil: isNonEmptyString(snoozedUntil) ? snoozedUntil : null,
      isHidden: userVars.get(GETTING_STARTED_HIDDEN_USER_VAR_KEY) ?? false,
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
    if (isDefined(input.selectedStepActionKey)) {
      await this.userVarsService.set({
        userId,
        workspaceId,
        key: GETTING_STARTED_SELECTED_STEP_USER_VAR_KEY,
        value: input.selectedStepActionKey,
      });
    }

    if (!isUndefined(input.snoozedUntil)) {
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

    if (isDefined(input.completedStepActionKey)) {
      await this.completeStep({
        userId,
        workspaceId,
        stepActionKey: input.completedStepActionKey,
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
    stepActionKey,
  }: {
    userId: string;
    workspaceId: string;
    stepActionKey: GettingStartedStepActionKey;
  }): Promise<void> {
    await this.userVarsService.setIfNotExists({
      userId,
      workspaceId,
      key: `${GETTING_STARTED_COMPLETED_STEP_USER_VAR_KEY_PREFIX}${stepActionKey}`,
      value: { completedAt: new Date().toISOString() },
    });
  }

  // Saved once final so late enrichment does not reshuffle the step list.
  private async getOrSaveAssignedStepActionKeys({
    userId,
    userEmail,
    workspaceId,
    savedStepActionKeys,
    companyEnrichment,
    companyEnrichmentAttempt,
  }: {
    userId: string;
    userEmail: string;
    workspaceId: string;
    savedStepActionKeys: string[] | undefined;
    companyEnrichment: WorkspaceCompanyEnrichment | null;
    companyEnrichmentAttempt: CompanyEnrichmentAttempt | null;
  }): Promise<GettingStartedStepActionKey[]> {
    if (isDefined(savedStepActionKeys)) {
      return savedStepActionKeys.filter(isGettingStartedStepActionKey);
    }

    const profile = getGettingStartedProfile({ userEmail, companyEnrichment });
    const stepActionKeys = GETTING_STARTED_STEP_ACTION_KEYS_BY_PROFILE[profile];

    if (
      profile === 'PERSONAL' ||
      isCompanyEnrichmentFinal({ companyEnrichment, companyEnrichmentAttempt })
    ) {
      await this.userVarsService.setIfNotExists({
        userId,
        workspaceId,
        key: GETTING_STARTED_STEP_ACTION_KEYS_USER_VAR_KEY,
        value: stepActionKeys,
      });
    }

    return stepActionKeys;
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

  private async findAlreadyDoneStepActionKeys({
    workspaceId,
    userWorkspaceId,
    stepActionKeys,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    stepActionKeys: GettingStartedStepActionKey[];
  }): Promise<GettingStartedStepActionKey[]> {
    const [hasConnectedMailbox, hasInstalledFeaturedApp] = await Promise.all([
      stepActionKeys.includes(GettingStartedStepActionKey.CONNECT_MAILBOX)
        ? this.hasOwnDraftingMailbox({ workspaceId, userWorkspaceId })
        : false,
      stepActionKeys.includes(GettingStartedStepActionKey.INSTALL_APP)
        ? this.hasInstalledFeaturedApp(workspaceId)
        : false,
    ]);

    return stepActionKeys.filter(
      (stepActionKey) =>
        (stepActionKey === GettingStartedStepActionKey.CONNECT_MAILBOX &&
          hasConnectedMailbox) ||
        (stepActionKey === GettingStartedStepActionKey.INSTALL_APP &&
          hasInstalledFeaturedApp),
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
