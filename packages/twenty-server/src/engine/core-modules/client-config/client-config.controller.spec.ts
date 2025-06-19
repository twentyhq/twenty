import { Test, TestingModule } from '@nestjs/testing';

import { SupportDriver } from 'src/engine/core-modules/twenty-config/interfaces/support.interface';

import { ModelProvider } from 'src/engine/core-modules/ai/entities/ai-model.entity';
import { ClientConfigService } from 'src/engine/core-modules/client-config/services/client-config.service';

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
            modelId: 'gpt-4o',
            displayName: 'GPT-4o',
            provider: ModelProvider.OPENAI,
            inputCostPer1kTokensInCents: 0.25,
            outputCostPer1kTokensInCents: 1.0,
            isActive: true,
            isDefault: true,
            createdAt: new Date('2024-01-01T00:00:00Z'),
            updatedAt: new Date('2024-01-01T00:00:00Z'),
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
        debugMode: true,
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
        chromeExtensionId: undefined,
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
        calendarBookingPageId: undefined,
      };

      jest
        .spyOn(clientConfigService, 'getClientConfig')
        .mockResolvedValue(mockClientConfig);

      const result = await controller.getClientConfig();

      expect(clientConfigService.getClientConfig).toHaveBeenCalled();
      expect(result).toEqual(mockClientConfig);
    });
  });
});
