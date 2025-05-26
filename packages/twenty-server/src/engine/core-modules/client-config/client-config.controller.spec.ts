import { Test, TestingModule } from '@nestjs/testing';

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
          supportDriver: 'none',
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
