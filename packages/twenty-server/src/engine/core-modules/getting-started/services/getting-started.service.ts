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
  COMPANY_ENRICHMENT_KEY,
  type CompanyEnrichmentKeyValueTypeMap,
} from 'src/engine/core-modules/company-enrichment/types/company-enrichment-key-value.type';
import { GETTING_STARTED_STEP_ACTION_KEYS_BY_PROFILE } from 'src/engine/core-modules/getting-started/constants/getting-started-step-action-keys-by-profile.constant';
import { type UpdateGettingStartedInput } from 'src/engine/core-modules/getting-started/dtos/update-getting-started.input';
import { GettingStartedStepActionKey } from 'src/engine/core-modules/getting-started/enums/getting-started-step-action-key.enum';
import {
  GETTING_STARTED_COMPLETED_STEP_USER_VARIABLE_KEY_PREFIX,
  GETTING_STARTED_HIDDEN_USER_VARIABLE_KEY,
  GETTING_STARTED_SELECTED_STEP_USER_VARIABLE_KEY,
  GETTING_STARTED_SNOOZED_UNTIL_USER_VARIABLE_KEY,
  GETTING_STARTED_STEP_ACTION_KEYS_USER_VARIABLE_KEY,
  GETTING_STARTED_WORKFLOW_USER_VARIABLE_KEY_PREFIX,
  type GettingStartedKeyValueTypeMap,
} from 'src/engine/core-modules/getting-started/types/getting-started-key-value-type-map.type';
import { type GettingStartedProgress } from 'src/engine/core-modules/getting-started/types/getting-started-progress.type';
import { filterGettingStartedStepActionKeys } from 'src/engine/core-modules/getting-started/utils/filter-getting-started-step-action-keys.util';
import { getGettingStartedProfile } from 'src/engine/core-modules/getting-started/utils/get-getting-started-profile.util';
import { isGettingStartedStepActionKey } from 'src/engine/core-modules/getting-started/utils/is-getting-started-step-action-key.util';
import { KeyValuePairType } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { KeyValuePairService } from 'src/engine/core-modules/key-value-pair/key-value-pair.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { SettingPermissionsService } from 'src/engine/permissions/setting-permissions.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

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
    private readonly settingPermissionsService: SettingPermissionsService,
    private readonly marketplaceQueryService: MarketplaceQueryService,
    private readonly keyValuePairService: KeyValuePairService<CompanyEnrichmentKeyValueTypeMap>,
    private readonly twentyConfigService: TwentyConfigService,
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
      [companyEnrichmentKeyValuePair],
      featuredApps,
    ] = await Promise.all([
      this.userVarsService.getAll({ userId, workspaceId }),
      this.settingPermissionsService.getUserWorkspacePermissions({
        userWorkspaceId,
        workspaceId,
      }),
      this.findOwnSendingMailbox({ workspaceId, userWorkspaceId }),
      this.keyValuePairService.get<typeof COMPANY_ENRICHMENT_KEY>({
        userId: null,
        workspaceId,
        type: KeyValuePairType.CONFIG_VARIABLE,
        key: COMPANY_ENRICHMENT_KEY,
      }),
      this.marketplaceQueryService.findManyMarketplaceApps({
        universalIdentifiers: [...GETTING_STARTED_APP_UNIVERSAL_IDENTIFIERS],
        isListed: true,
      }),
    ]);

    const companyEnrichment = companyEnrichmentKeyValuePair?.value ?? null;

    const assignedStepActionKeys = await this.getOrSaveAssignedStepActionKeys({
      userId,
      userEmail,
      workspaceId,
      savedStepActionKeys: userVars.get(
        GETTING_STARTED_STEP_ACTION_KEYS_USER_VARIABLE_KEY,
      ),
      companyEnrichment,
    });

    const stepActionKeys = filterGettingStartedStepActionKeys({
      stepActionKeys: assignedStepActionKeys,
      permissionFlags,
      hasSendingMailbox: isDefined(ownSendingMailbox),
      hasFeaturedApp: isNonEmptyArray(featuredApps),
      hasCalendarBookingPage: isNonEmptyString(
        this.twentyConfigService.get('CALENDAR_BOOKING_PAGE_ID'),
      ),
    });

    const getSavedCompletion = (stepActionKey: GettingStartedStepActionKey) =>
      userVars.get(
        `${GETTING_STARTED_COMPLETED_STEP_USER_VARIABLE_KEY_PREFIX}${stepActionKey}`,
      );

    const isSavedAsCompleted = (stepActionKey: GettingStartedStepActionKey) =>
      isDefined(getSavedCompletion(stepActionKey));

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
      GETTING_STARTED_SELECTED_STEP_USER_VARIABLE_KEY,
    );
    const snoozedUntil = userVars.get(
      GETTING_STARTED_SNOOZED_UNTIL_USER_VARIABLE_KEY,
    );

    const chatThreadIdByStepActionKey = Object.fromEntries(
      completedStepActionKeys.map(
        (stepActionKey) =>
          [
            stepActionKey,
            getSavedCompletion(stepActionKey)?.chatThreadId,
          ] as const,
      ),
    );

    const workflowIdByStepActionKey = Object.fromEntries(
      completedStepActionKeys.map(
        (stepActionKey) =>
          [
            stepActionKey,
            userVars.get(
              `${GETTING_STARTED_WORKFLOW_USER_VARIABLE_KEY_PREFIX}${stepActionKey}`,
            )?.workflowId,
          ] as const,
      ),
    );

    return {
      stepActionKeys,
      companyEnrichment,
      chatThreadIdByStepActionKey,
      workflowIdByStepActionKey,
      completedStepActionKeys,
      selectedStepActionKey:
        stepActionKeys.find(
          (stepActionKey) => stepActionKey === savedSelectedStepActionKey,
        ) ?? null,
      snoozedUntil: isNonEmptyString(snoozedUntil) ? snoozedUntil : null,
      isHidden: userVars.get(GETTING_STARTED_HIDDEN_USER_VARIABLE_KEY) ?? false,
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
        key: GETTING_STARTED_SELECTED_STEP_USER_VARIABLE_KEY,
        value: input.selectedStepActionKey,
      });
    }

    if (!isUndefined(input.snoozedUntil)) {
      await this.userVarsService.set({
        userId,
        workspaceId,
        key: GETTING_STARTED_SNOOZED_UNTIL_USER_VARIABLE_KEY,
        value: input.snoozedUntil,
      });
    }

    if (isDefined(input.isHidden)) {
      await this.userVarsService.set({
        userId,
        workspaceId,
        key: GETTING_STARTED_HIDDEN_USER_VARIABLE_KEY,
        value: input.isHidden,
      });
    }

    if (isDefined(input.completedStepActionKey)) {
      await this.completeStep({
        userId,
        workspaceId,
        stepActionKey: input.completedStepActionKey,
        chatThreadId: input.completedStepChatThreadId,
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
    chatThreadId,
  }: {
    userId: string;
    workspaceId: string;
    stepActionKey: GettingStartedStepActionKey;
    chatThreadId?: string | null;
  }): Promise<void> {
    await this.userVarsService.setIfNotExists({
      userId,
      workspaceId,
      key: `${GETTING_STARTED_COMPLETED_STEP_USER_VARIABLE_KEY_PREFIX}${stepActionKey}`,
      value: {
        completedAt: new Date().toISOString(),
        ...(isDefined(chatThreadId) ? { chatThreadId } : {}),
      },
    });
  }

  private async getOrSaveAssignedStepActionKeys({
    userId,
    userEmail,
    workspaceId,
    savedStepActionKeys,
    companyEnrichment,
  }: {
    userId: string;
    userEmail: string;
    workspaceId: string;
    savedStepActionKeys: string[] | undefined;
    companyEnrichment: WorkspaceCompanyEnrichment | null;
  }): Promise<GettingStartedStepActionKey[]> {
    if (isDefined(savedStepActionKeys)) {
      return savedStepActionKeys.filter(isGettingStartedStepActionKey);
    }

    const profile = getGettingStartedProfile({ userEmail, companyEnrichment });
    const stepActionKeys = GETTING_STARTED_STEP_ACTION_KEYS_BY_PROFILE[profile];

    await this.userVarsService.setIfNotExists({
      userId,
      workspaceId,
      key: GETTING_STARTED_STEP_ACTION_KEYS_USER_VARIABLE_KEY,
      value: stepActionKeys,
    });

    return stepActionKeys;
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
        ? this.connectedAccountMetadataService.hasOwnMailOrCalendarAccount({
            workspaceId,
            userWorkspaceId,
          })
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

  private hasInstalledFeaturedApp(workspaceId: string): Promise<boolean> {
    return this.applicationRepository.exists(workspaceId, {
      where: {
        universalIdentifier: In(GETTING_STARTED_APP_UNIVERSAL_IDENTIFIERS),
      },
    });
  }
}
