import { Injectable } from '@nestjs/common';

import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';
import { SupportDriver } from 'src/engine/core-modules/twenty-config/interfaces/support.interface';

import {
  AI_MODELS,
  ModelProvider,
} from 'src/engine/core-modules/ai/constants/ai-models.const';
import { AiModelRegistryService } from 'src/engine/core-modules/ai/services/ai-model-registry.service';
import { convertCentsToBillingCredits } from 'src/engine/core-modules/ai/utils/convert-cents-to-billing-credits.util';
import {
  ClientAIModelConfig,
  ClientConfig,
} from 'src/engine/core-modules/client-config/client-config.entity';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { PUBLIC_FEATURE_FLAGS } from 'src/engine/core-modules/feature-flag/constants/public-feature-flag.const';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class ClientConfigService {
  constructor(
    private twentyConfigService: TwentyConfigService,
    private domainManagerService: DomainManagerService,
    private aiModelRegistryService: AiModelRegistryService,
  ) {}

  async getClientConfig(): Promise<ClientConfig> {
    const captchaProvider = this.twentyConfigService.get('CAPTCHA_DRIVER');
    const supportDriver = this.twentyConfigService.get('SUPPORT_DRIVER');

    const availableModels = this.aiModelRegistryService.getAvailableModels();

    const aiModels: ClientAIModelConfig[] = availableModels.map(
      (registeredModel) => {
        const builtInModel = AI_MODELS.find(
          (m) => m.modelId === registeredModel.modelId,
        );

        return {
          modelId: registeredModel.modelId,
          label: builtInModel?.label || registeredModel.modelId,
          provider: registeredModel.provider,
          inputCostPer1kTokensInCredits: builtInModel
            ? convertCentsToBillingCredits(
                builtInModel.inputCostPer1kTokensInCents,
              )
            : 0,
          outputCostPer1kTokensInCredits: builtInModel
            ? convertCentsToBillingCredits(
                builtInModel.outputCostPer1kTokensInCents,
              )
            : 0,
        };
      },
    );

    if (aiModels.length > 0) {
      aiModels.unshift({
        modelId: 'auto',
        label: 'Auto',
        provider: ModelProvider.NONE,
        inputCostPer1kTokensInCredits: 0,
        outputCostPer1kTokensInCredits: 0,
      });
    }

    const clientConfig: ClientConfig = {
      billing: {
        isBillingEnabled: this.twentyConfigService.get('IS_BILLING_ENABLED'),
        billingUrl: this.twentyConfigService.get('BILLING_PLAN_REQUIRED_LINK'),
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
      frontDomain: this.domainManagerService.getFrontUrl().hostname,
      debugMode:
        this.twentyConfigService.get('NODE_ENV') ===
        NodeEnvironment.DEVELOPMENT,
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
      },
      captcha: {
        provider: captchaProvider ? captchaProvider : undefined,
        siteKey: this.twentyConfigService.get('CAPTCHA_SITE_KEY'),
      },
      chromeExtensionId: this.twentyConfigService.get('CHROME_EXTENSION_ID'),
      api: {
        mutationMaximumAffectedRecords: this.twentyConfigService.get(
          'MUTATION_MAXIMUM_AFFECTED_RECORDS',
        ),
      },
      isAttachmentPreviewEnabled: this.twentyConfigService.get(
        'IS_ATTACHMENT_PREVIEW_ENABLED',
      ),
      analyticsEnabled: this.twentyConfigService.get('ANALYTICS_ENABLED'),
      canManageFeatureFlags:
        this.twentyConfigService.get('NODE_ENV') ===
          NodeEnvironment.DEVELOPMENT ||
        this.twentyConfigService.get('IS_BILLING_ENABLED'),
      publicFeatureFlags: PUBLIC_FEATURE_FLAGS,
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
      calendarBookingPageId: this.twentyConfigService.get(
        'CALENDAR_BOOKING_PAGE_ID',
      ),
    };

    return clientConfig;
  }
}
