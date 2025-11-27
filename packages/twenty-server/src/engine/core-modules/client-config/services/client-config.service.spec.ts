import { Test, type TestingModule } from '@nestjs/testing';

import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';
import { SupportDriver } from 'src/engine/core-modules/twenty-config/interfaces/support.interface';

import { CaptchaDriverType } from 'src/engine/core-modules/captcha/interfaces';
import { ClientConfigService } from 'src/engine/core-modules/client-config/services/client-config.service';
import { DomainServerConfigService } from 'src/engine/core-modules/domain/domain-server-config/services/domain-server-config.service';
import { PUBLIC_FEATURE_FLAGS } from 'src/engine/core-modules/feature-flag/constants/public-feature-flag.const';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

describe('ClientConfigService', () => {
  let service: ClientConfigService;
  let twentyConfigService: TwentyConfigService;
  let domainServerConfigService: DomainServerConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientConfigService,
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: DomainServerConfigService,
          useValue: {
            getFrontUrl: jest.fn(),
          },
        },
        {
          provide: AiModelRegistryService,
          useValue: {
            getAvailableModels: jest.fn().mockReturnValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<ClientConfigService>(ClientConfigService);
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
    domainServerConfigService = module.get<DomainServerConfigService>(
      DomainServerConfigService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getClientConfig', () => {
    beforeEach(() => {
      // Setup default mock values
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          const mockValues: Record<string, any> = {
            IS_BILLING_ENABLED: true,
            BILLING_PLAN_REQUIRED_LINK: 'https://billing.example.com',
            BILLING_FREE_TRIAL_WITH_CREDIT_CARD_DURATION_IN_DAYS: 30,
            BILLING_FREE_TRIAL_WITHOUT_CREDIT_CARD_DURATION_IN_DAYS: 7,
            AUTH_GOOGLE_ENABLED: true,
            AUTH_PASSWORD_ENABLED: true,
            AUTH_MICROSOFT_ENABLED: false,
            SIGN_IN_PREFILLED: false,
            IS_MULTIWORKSPACE_ENABLED: true,
            IS_EMAIL_VERIFICATION_REQUIRED: true,
            DEFAULT_SUBDOMAIN: 'app',
            NODE_ENV: NodeEnvironment.DEVELOPMENT,
            SUPPORT_DRIVER: SupportDriver.FRONT,
            SUPPORT_FRONT_CHAT_ID: 'chat-123',
            SENTRY_ENVIRONMENT: 'development',
            APP_VERSION: '1.0.0',
            SENTRY_FRONT_DSN: 'https://sentry.example.com',
            CAPTCHA_DRIVER: CaptchaDriverType.GOOGLE_RECAPTCHA,
            CAPTCHA_SITE_KEY: 'site-key-123',
            CHROME_EXTENSION_ID: 'extension-123',
            MUTATION_MAXIMUM_AFFECTED_RECORDS: 1000,
            IS_ATTACHMENT_PREVIEW_ENABLED: true,
            ANALYTICS_ENABLED: true,
            MESSAGING_PROVIDER_MICROSOFT_ENABLED: false,
            CALENDAR_PROVIDER_MICROSOFT_ENABLED: false,
            MESSAGING_PROVIDER_GMAIL_ENABLED: true,
            CALENDAR_PROVIDER_GOOGLE_ENABLED: true,
            IS_CONFIG_VARIABLES_IN_DB_ENABLED: false,
            CALENDAR_BOOKING_PAGE_ID: 'team/twenty/talk-to-us',
          };

          return mockValues[key];
        });

      jest.spyOn(domainServerConfigService, 'getFrontUrl').mockReturnValue({
        hostname: 'app.twenty.com',
      } as URL);
    });

    it('should return complete client config with all properties', async () => {
      const result = await service.getClientConfig();

      expect(result).toEqual({
        appVersion: '1.0.0',
        billing: {
          isBillingEnabled: true,
          billingUrl: 'https://billing.example.com',
          trialPeriods: [
            {
              duration: 30,
              isCreditCardRequired: true,
            },
            {
              duration: 7,
              isCreditCardRequired: false,
            },
          ],
        },
        aiModels: [],
        authProviders: {
          google: true,
          magicLink: false,
          password: true,
          microsoft: false,
          sso: [],
        },
        signInPrefilled: false,
        isMultiWorkspaceEnabled: true,
        isEmailVerificationRequired: true,
        defaultSubdomain: 'app',
        frontDomain: 'app.twenty.com',
        support: {
          supportDriver: 'FRONT',
          supportFrontChatId: 'chat-123',
        },
        sentry: {
          environment: 'development',
          release: '1.0.0',
          dsn: 'https://sentry.example.com',
        },
        captcha: {
          provider: 'GOOGLE_RECAPTCHA',
          siteKey: 'site-key-123',
        },
        chromeExtensionId: 'extension-123',
        api: {
          mutationMaximumAffectedRecords: 1000,
        },
        isAttachmentPreviewEnabled: true,
        analyticsEnabled: true,
        canManageFeatureFlags: true,
        publicFeatureFlags: PUBLIC_FEATURE_FLAGS,
        isMicrosoftMessagingEnabled: false,
        isMicrosoftCalendarEnabled: false,
        isGoogleMessagingEnabled: true,
        isGoogleCalendarEnabled: true,
        isConfigVariablesInDbEnabled: false,
        calendarBookingPageId: 'team/twenty/talk-to-us',
      });
    });

    it('should handle production environment correctly', async () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          if (key === 'NODE_ENV') return NodeEnvironment.PRODUCTION;
          if (key === 'IS_BILLING_ENABLED') return false;

          return undefined;
        });

      const result = await service.getClientConfig();

      expect(result.canManageFeatureFlags).toBe(false);
      expect(result.aiModels).toEqual([]);
    });

    it('should handle missing captcha driver', async () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          if (key === 'CAPTCHA_DRIVER') return undefined;
          if (key === 'CAPTCHA_SITE_KEY') return 'site-key';

          return undefined;
        });

      const result = await service.getClientConfig();

      expect(result.captcha.provider).toBeUndefined();
      expect(result.captcha.siteKey).toBe('site-key');
      expect(result.aiModels).toEqual([]);
    });

    it('should handle missing support driver', async () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          if (key === 'SUPPORT_DRIVER') return undefined;

          return undefined;
        });

      const result = await service.getClientConfig();

      expect(result.support.supportDriver).toBe(SupportDriver.NONE);
      expect(result.aiModels).toEqual([]);
    });

    it('should handle billing enabled with feature flags', async () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          if (key === 'NODE_ENV') return NodeEnvironment.PRODUCTION;
          if (key === 'IS_BILLING_ENABLED') return true;

          return undefined;
        });

      const result = await service.getClientConfig();

      expect(result.canManageFeatureFlags).toBe(true);
    });
  });
});
