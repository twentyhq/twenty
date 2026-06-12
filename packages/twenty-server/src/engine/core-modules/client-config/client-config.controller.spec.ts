import { Test, type TestingModule } from '@nestjs/testing';

import { SupportDriver } from 'src/engine/core-modules/twenty-config/interfaces/support.interface';

import { ClientConfigService } from 'src/engine/core-modules/client-config/services/client-config.service';
import { ModelFamily } from 'src/engine/metadata-modules/ai/ai-models/types/model-family.enum';
import { type ModelId } from 'src/engine/metadata-modules/ai/ai-models/types/model-id.type';

import { ClientConfigController } from './client-config.controller';

describe('ClientConfigController', () => {
  let controller: ClientConfigController;
  let clientConfigService: ClientConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientConfigController],
      providers: [
        {
          provide: ClientConfigService,
          useValue: {
            getClientConfig: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ClientConfigController>(ClientConfigController);
    clientConfigService = module.get<ClientConfigService>(ClientConfigService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getClientConfig', () => {
    it('should return client config from service', async () => {
      const mockClientConfig = {
        billing: {
          isBillingEnabled: true,
          billingUrl: 'https://billing.example.com',
          trialPeriods: [
            {
              duration: 7,
              isCreditCardRequired: false,
            },
          ],
        },
        aiModels: [
          {
            modelId: 'openai/gpt-4o' as ModelId,
            label: 'GPT-4o',
            modelFamily: ModelFamily.GPT,
            sdkPackage: '@ai-sdk/openai' as const,
            inputCostPerMillionTokensInCredits: 2500000,
            outputCostPerMillionTokensInCredits: 10000000,
          },
        ],
        authProviders: {
          google: true,
          magicLink: false,
          password: true,
          microsoft: false,
          sso: [],
        },
        signInPrefilled: false,
        isMultiWorkspaceEnabled: true,
        isEmailVerificationRequired: false,
        defaultSubdomain: 'app',
        frontDomain: 'localhost',
        support: {
          supportDriver: SupportDriver.NONE,
          supportFrontChatId: undefined,
        },
        sentry: {
          environment: 'development',
          release: '1.0.0',
          dsn: undefined,
        },
        captcha: {
          provider: undefined,
          siteKey: undefined,
        },
        api: {
          mutationMaximumAffectedRecords: 100,
        },
        isAttachmentPreviewEnabled: true,
        analyticsEnabled: false,
        canManageFeatureFlags: true,
        publicFeatureFlags: [],
        isMicrosoftMessagingEnabled: false,
        isMicrosoftCalendarEnabled: false,
        isGoogleMessagingEnabled: false,
        isGoogleCalendarEnabled: false,
        isConfigVariablesInDbEnabled: false,
        isImapSmtpCaldavEnabled: false,
        calendarBookingPageId: undefined,
        isTwoFactorAuthenticationEnabled: false,
        allowRequestsToTwentyIcons: true,
        isCloudflareIntegrationEnabled: false,
        isClickHouseConfigured: false,
        isWorkspaceSchemaDDLLocked: false,
      };

      jest
        .spyOn(clientConfigService, 'getClientConfig')
        .mockResolvedValue(mockClientConfig);

      const result = await controller.getClientConfig();

      expect(result).toEqual(mockClientConfig);
      expect(clientConfigService.getClientConfig).toHaveBeenCalled();
    });
  });
});
