import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { readIsCompanyEnrichmentEnabled } from 'src/engine/core-modules/company-enrichment/utils/read-is-company-enrichment-enabled.util';
import { readBookCallStepMinEmployeeCount } from 'src/engine/core-modules/onboarding/utils/read-book-call-step-min-employee-count.util';
import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';
import { SupportDriver } from 'src/engine/core-modules/twenty-config/interfaces/support.interface';

import { MaintenanceModeService } from 'src/engine/core-modules/admin-panel/maintenance-mode.service';
import {
  type ClientAiModelConfig,
  type ClientConfig,
} from 'src/engine/core-modules/client-config/client-config.entity';
import { DomainServerConfigService } from 'src/engine/core-modules/domain/domain-server-config/services/domain-server-config.service';
import { EmailingDomainDriver } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-driver.type';
import { PUBLIC_FEATURE_FLAGS } from 'src/engine/core-modules/feature-flag/constants/public-feature-flag.const';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';
import { AI_MODEL_TIERS, parseAiModelVariantId } from 'twenty-shared/ai';
import { ENTERPRISE_INSTANCE_TYPE } from 'twenty-shared/constants';
import { MODEL_FAMILY_LABELS } from 'src/engine/metadata-modules/ai/ai-models/constants/model-family-labels.const';
import { getAvailableEfforts } from 'src/engine/metadata-modules/ai/ai-models/utils/get-available-efforts.util';
import { getNativeModelCapabilities } from 'src/engine/metadata-modules/ai/ai-models/utils/get-native-model-capabilities.util';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { type AiModelBenchmark } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-benchmark.type';
import { type AiModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-config.type';
import { getRecordGroupPageSize } from 'src/engine/core-modules/client-config/utils/get-record-group-page-size.util';

@Injectable()
export class ClientConfigService {
  constructor(
    private twentyConfigService: TwentyConfigService,
    private domainServerConfigService: DomainServerConfigService,
    private aiModelRegistryService: AiModelRegistryService,
    private maintenanceModeService: MaintenanceModeService,
  ) {}

  // A variant carries only the reading taken at its own effort, so until the
  // sync measures it the base model's reading is shown, flagged as such.
  private resolveBenchmark(modelConfig: AiModelConfig | undefined): {
    benchmark?: AiModelBenchmark;
    isInherited: boolean;
  } {
    if (isDefined(modelConfig?.benchmark)) {
      return { benchmark: modelConfig.benchmark, isInherited: false };
    }

    const { modelId: baseModelId, effort } = parseAiModelVariantId(
      modelConfig?.modelId ?? '',
    );
    const baseBenchmark = isDefined(effort)
      ? this.aiModelRegistryService.getModelConfig(baseModelId)?.benchmark
      : undefined;

    return { benchmark: baseBenchmark, isInherited: isDefined(baseBenchmark) };
  }

  private isCloudflareIntegrationEnabled(): boolean {
    return (
      !!this.twentyConfigService.get('CLOUDFLARE_API_KEY') &&
      !!this.twentyConfigService.get('CLOUDFLARE_ZONE_ID')
    );
  }

  async getClientConfig(): Promise<ClientConfig> {
    const captchaProvider = this.twentyConfigService.get('CAPTCHA_DRIVER');
    const supportDriver = this.twentyConfigService.get('SUPPORT_DRIVER');
    const calendarBookingPageId = this.twentyConfigService.get(
      'CALENDAR_BOOKING_PAGE_ID',
    );
    const isBookCallOnboardingStepEnabled = isDefined(
      readBookCallStepMinEmployeeCount(this.twentyConfigService),
    );
    const isCompanyEnrichmentEnabled = readIsCompanyEnrichmentEnabled(
      this.twentyConfigService,
    );

    const isEmailingDomainInDemoMode =
      this.twentyConfigService.get('EMAILING_DOMAIN_DRIVER') ===
      EmailingDomainDriver.LOG;

    const isBillingEnabled = this.twentyConfigService.get('IS_BILLING_ENABLED');

    const availableModels =
      this.aiModelRegistryService.getAdminFilteredModels();
    const resolvedProviders =
      this.aiModelRegistryService.getResolvedProvidersForAdmin();

    const getProviderLabel = (providerName?: string | null) =>
      providerName
        ? (resolvedProviders[providerName]?.label ?? providerName)
        : undefined;

    const aiModels: ClientAiModelConfig[] = availableModels.map(
      (registeredModel) => {
        const modelConfig = this.aiModelRegistryService.getModelConfig(
          registeredModel.modelId,
        );

        const modelFamily = modelConfig?.modelFamily;
        const providerName = registeredModel.providerName;
        const { benchmark, isInherited } = this.resolveBenchmark(modelConfig);

        return {
          modelId: registeredModel.modelId,
          label: modelConfig?.label || registeredModel.modelId,
          modelFamily,
          modelFamilyLabel: modelFamily
            ? MODEL_FAMILY_LABELS[modelFamily]
            : undefined,
          sdkPackage: registeredModel.sdkPackage,
          providerName,
          providerLabel: getProviderLabel(providerName),
          nativeCapabilities: getNativeModelCapabilities(
            registeredModel.sdkPackage,
          ),
          inputCostPerMillionTokens: modelConfig?.inputCostPerMillionTokens,
          outputCostPerMillionTokens: modelConfig?.outputCostPerMillionTokens,
          contextWindowTokens: modelConfig?.contextWindowTokens,
          maxOutputTokens: modelConfig?.maxOutputTokens,
          isDeprecated: modelConfig?.isDeprecated,
          dataResidency: modelConfig?.dataResidency,
          intelligenceIndex: benchmark?.intelligenceIndex,
          outputTokensPerSecond: benchmark?.outputTokensPerSecond,
          costPerTask: benchmark?.costPerTask,
          isBenchmarkInherited: isInherited,
          efforts:
            isDefined(modelConfig) && !isDefined(modelConfig.effort)
              ? getAvailableEfforts(modelConfig)
              : undefined,
          effort: modelConfig?.effort,
        };
      },
    );

    // A tier with no model is left out; the client shows its "configure a
    // provider" state from the empty list rather than an error.
    const aiModelTiers = AI_MODEL_TIERS.flatMap((tier) => {
      const model = this.aiModelRegistryService.findDefaultModelForTier(tier);

      return isDefined(model) ? [{ tier, modelId: model.modelId }] : [];
    });

    const clientConfig: ClientConfig = {
      appVersion: this.twentyConfigService.get('APP_VERSION'),
      billing: {
        isBillingEnabled,
        billingUrl: this.twentyConfigService.get('BILLING_PLAN_REQUIRED_LINK'),
        stripePublishableKey: this.twentyConfigService.get(
          'BILLING_STRIPE_PUBLISHABLE_KEY',
        ),
        trialPeriods: [
          {
            duration: this.twentyConfigService.get(
              'BILLING_FREE_TRIAL_WITH_CREDIT_CARD_DURATION_IN_DAYS',
            ),
            isCreditCardRequired: true,
          },
          {
            duration: this.twentyConfigService.get(
              'BILLING_FREE_TRIAL_WITHOUT_CREDIT_CARD_DURATION_IN_DAYS',
            ),
            isCreditCardRequired: false,
          },
        ],
      },
      aiModels,
      aiModelTiers,
      authProviders: {
        google: this.twentyConfigService.get('AUTH_GOOGLE_ENABLED'),
        magicLink: false,
        password: this.twentyConfigService.get('AUTH_PASSWORD_ENABLED'),
        microsoft: this.twentyConfigService.get('AUTH_MICROSOFT_ENABLED'),
        sso: [],
      },
      signInPrefilled: this.twentyConfigService.get('SIGN_IN_PREFILLED'),
      isMultiWorkspaceEnabled: this.twentyConfigService.get(
        'IS_MULTIWORKSPACE_ENABLED',
      ),
      isEmailVerificationRequired: this.twentyConfigService.get(
        'IS_EMAIL_VERIFICATION_REQUIRED',
      ),
      defaultSubdomain: this.twentyConfigService.get('DEFAULT_SUBDOMAIN'),
      frontDomain: this.domainServerConfigService.getFrontUrl().hostname,
      publicFunctionDomain:
        this.domainServerConfigService.getPublicBaseHostnameOrUndefined() ??
        null,
      support: {
        supportDriver: supportDriver ? supportDriver : SupportDriver.NONE,
        supportFrontChatId: this.twentyConfigService.get(
          'SUPPORT_FRONT_CHAT_ID',
        ),
      },
      sentry: {
        environment: this.twentyConfigService.get('SENTRY_ENVIRONMENT'),
        release: this.twentyConfigService.get('APP_VERSION'),
        dsn: this.twentyConfigService.get('SENTRY_FRONT_DSN'),
        tracesSampleRate: this.twentyConfigService.get(
          'SENTRY_FRONT_TRACES_SAMPLE_RATE',
        ),
      },
      captcha: {
        provider: captchaProvider ? captchaProvider : undefined,
        siteKey: this.twentyConfigService.get('CAPTCHA_SITE_KEY'),
      },
      api: {
        mutationMaximumAffectedRecords: this.twentyConfigService.get(
          'MUTATION_MAXIMUM_AFFECTED_RECORDS',
        ),
      },
      onboarding: isBillingEnabled
        ? {
            importContactsCreditsReward: toDisplayCredits(
              this.twentyConfigService.get(
                'ONBOARDING_IMPORT_CONTACTS_CREDITS_REWARD',
              ),
            ),
            inviteTeamCreditsRewardPerUser: toDisplayCredits(
              this.twentyConfigService.get(
                'ONBOARDING_INVITE_TEAM_CREDITS_REWARD_PER_USER',
              ),
            ),
            upgradeCreditsReward: toDisplayCredits(
              this.twentyConfigService.get(
                'BILLING_FREE_WORKFLOW_CREDITS_FOR_TRIAL_PERIOD_WITH_CREDIT_CARD',
              ),
            ),
            installAppsCreditsRewardPerApp: toDisplayCredits(
              this.twentyConfigService.get(
                'ONBOARDING_INSTALL_APPS_CREDITS_REWARD_PER_APP',
              ),
            ),
          }
        : null,
      isAttachmentPreviewEnabled: this.twentyConfigService.get(
        'IS_ATTACHMENT_PREVIEW_ENABLED',
      ),
      analyticsEnabled: this.twentyConfigService.get('ANALYTICS_ENABLED'),
      canManageFeatureFlags:
        this.twentyConfigService.get('NODE_ENV') ===
          NodeEnvironment.DEVELOPMENT ||
        isBillingEnabled ||
        this.twentyConfigService.get('IS_FEATURE_FLAG_MANAGEMENT_ENABLED'),
      publicFeatureFlags: PUBLIC_FEATURE_FLAGS,
      isCookieSessionEnabled: true,
      isMicrosoftMessagingEnabled: this.twentyConfigService.get(
        'MESSAGING_PROVIDER_MICROSOFT_ENABLED',
      ),
      isMicrosoftCalendarEnabled: this.twentyConfigService.get(
        'CALENDAR_PROVIDER_MICROSOFT_ENABLED',
      ),
      isGoogleMessagingEnabled: this.twentyConfigService.get(
        'MESSAGING_PROVIDER_GMAIL_ENABLED',
      ),
      isGoogleCalendarEnabled: this.twentyConfigService.get(
        'CALENDAR_PROVIDER_GOOGLE_ENABLED',
      ),
      isConfigVariablesInDbEnabled: this.twentyConfigService.get(
        'IS_CONFIG_VARIABLES_IN_DB_ENABLED',
      ),
      isImapSmtpCaldavEnabled: this.twentyConfigService.get(
        'IS_IMAP_SMTP_CALDAV_ENABLED',
      ),
      isEmailingDomainInDemoMode,
      allowRequestsToTwentyIcons: this.twentyConfigService.get(
        'ALLOW_REQUESTS_TO_TWENTY_ICONS',
      ),
      calendarBookingPageId: isNonEmptyString(calendarBookingPageId)
        ? calendarBookingPageId
        : undefined,
      isBookCallOnboardingStepEnabled,
      isCompanyEnrichmentEnabled,
      isCloudflareIntegrationEnabled: this.isCloudflareIntegrationEnabled(),
      isClickHouseConfigured: !!this.twentyConfigService.get('CLICKHOUSE_URL'),
      isWorkspaceSchemaDDLLocked: this.twentyConfigService.get(
        'WORKSPACE_SCHEMA_DDL_LOCKED',
      ),
      isOnboardingAiChatEnabled: this.twentyConfigService.get(
        'IS_ONBOARDING_AI_CHAT_ENABLED',
      ),
      recordGroupPageSize: getRecordGroupPageSize(
        this.twentyConfigService.get('RECORD_GROUP_PAGE_SIZE'),
      ),
      enterpriseInstanceType:
        this.twentyConfigService.get('ENTERPRISE_INSTANCE_TYPE') ??
        ENTERPRISE_INSTANCE_TYPE.PRODUCTION,
    };

    const maintenanceMode =
      await this.maintenanceModeService.getMaintenanceMode();

    if (isDefined(maintenanceMode)) {
      clientConfig.maintenance = {
        startAt: new Date(maintenanceMode.startAt),
        endAt: new Date(maintenanceMode.endAt),
        link: maintenanceMode.link,
      };
    }

    return clientConfig;
  }
}
