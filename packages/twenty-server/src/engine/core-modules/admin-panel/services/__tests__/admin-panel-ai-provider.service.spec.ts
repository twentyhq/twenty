/* @license Enterprise */

import { Test, type TestingModule } from '@nestjs/testing';

import { AdminPanelAiProviderService } from 'src/engine/core-modules/admin-panel/services/admin-panel-ai-provider.service';
import { MAX_SEATS_WITHOUT_ENTERPRISE_KEY } from 'src/engine/core-modules/enterprise/constants/max-seats-without-enterprise-key.constant';
import { EnterpriseExceptionCode } from 'src/engine/core-modules/enterprise/enterprise.exception';
import { CustomAiProviderAccessService } from 'src/engine/core-modules/enterprise/services/custom-ai-provider-access.service';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { DefaultAiCatalogService } from 'src/engine/metadata-modules/ai/ai-models/services/default-ai-catalog.service';

describe('AdminPanelAiProviderService', () => {
  let service: AdminPanelAiProviderService;
  let providers: Record<string, unknown>;

  const twentyConfigService = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const enterprisePlanService = {
    isValid: jest.fn(),
    getBillableSeatCount: jest.fn(),
  };

  const givenInstance = ({
    seatCount,
    isBillingEnabled = false,
    isEnterpriseValid = false,
  }: {
    seatCount: number;
    isBillingEnabled?: boolean;
    isEnterpriseValid?: boolean;
  }) => {
    twentyConfigService.get.mockImplementation((key: string) =>
      key === 'IS_BILLING_ENABLED' ? isBillingEnabled : providers,
    );
    enterprisePlanService.isValid.mockReturnValue(isEnterpriseValid);
    enterprisePlanService.getBillableSeatCount.mockResolvedValue(seatCount);
  };

  const addProvider = () =>
    service.addProvider({
      providerName: 'my-gateway',
      providerConfig: {
        npm: '@ai-sdk/openai-compatible',
        baseUrl: 'https://gateway.internal',
      },
    });

  beforeEach(async () => {
    jest.clearAllMocks();
    providers = {};

    twentyConfigService.set.mockImplementation(
      async (_key: string, value: Record<string, unknown>) => {
        providers = value;
      },
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminPanelAiProviderService,
        // The real gate is registered so these cover the seat rules end to end
        // rather than a stub of the very logic under test.
        CustomAiProviderAccessService,
        { provide: TwentyConfigService, useValue: twentyConfigService },
        { provide: EnterprisePlanService, useValue: enterprisePlanService },
        { provide: AiModelRegistryService, useValue: {} },
        { provide: DefaultAiCatalogService, useValue: {} },
      ],
    }).compile();

    service = module.get<AdminPanelAiProviderService>(
      AdminPanelAiProviderService,
    );
  });

  describe('addProvider', () => {
    it('persists the provider when the instance is under the seat threshold', async () => {
      givenInstance({ seatCount: MAX_SEATS_WITHOUT_ENTERPRISE_KEY - 1 });

      await expect(addProvider()).resolves.toBe(true);
      expect(providers).toHaveProperty('my-gateway');
    });

    it('refuses and persists nothing above the threshold without an enterprise key', async () => {
      givenInstance({ seatCount: MAX_SEATS_WITHOUT_ENTERPRISE_KEY + 1 });

      await expect(addProvider()).rejects.toMatchObject({
        code: EnterpriseExceptionCode.ENTERPRISE_SEAT_THRESHOLD_EXCEEDED,
      });
      expect(twentyConfigService.set).not.toHaveBeenCalled();
    });

    it('persists the provider above the threshold with a valid enterprise key', async () => {
      givenInstance({
        seatCount: MAX_SEATS_WITHOUT_ENTERPRISE_KEY + 100,
        isEnterpriseValid: true,
      });

      await expect(addProvider()).resolves.toBe(true);
      expect(providers).toHaveProperty('my-gateway');
    });

    it('rejects a config whose npm package is not a supported SDK', async () => {
      givenInstance({ seatCount: 1 });

      await expect(
        service.addProvider({
          providerName: 'my-gateway',
          providerConfig: { npm: 'not-an-ai-sdk-package' },
        }),
      ).rejects.toThrow('Invalid provider configuration');
      expect(twentyConfigService.set).not.toHaveBeenCalled();
    });

    it('rejects a provider name that is not slug-safe', async () => {
      givenInstance({ seatCount: 1 });

      await expect(
        service.addProvider({
          providerName: 'not a slug',
          providerConfig: {
            npm: '@ai-sdk/openai-compatible',
            baseUrl: 'https://gateway.internal',
          },
        }),
      ).rejects.toThrow('Invalid provider name');
    });
  });

  describe('addModelToProvider', () => {
    it('refuses above the threshold without an enterprise key', async () => {
      givenInstance({ seatCount: MAX_SEATS_WITHOUT_ENTERPRISE_KEY + 1 });

      await expect(
        service.addModelToProvider({
          providerName: 'my-gateway',
          modelConfig: { name: 'gpt-4o', label: 'GPT-4o' },
        }),
      ).rejects.toMatchObject({
        code: EnterpriseExceptionCode.ENTERPRISE_SEAT_THRESHOLD_EXCEEDED,
      });
    });
  });

  describe('removeProvider', () => {
    it('stays available above the threshold so providers can be cleaned up', async () => {
      givenInstance({ seatCount: MAX_SEATS_WITHOUT_ENTERPRISE_KEY + 1 });
      providers = { 'my-gateway': { npm: '@ai-sdk/openai-compatible' } };

      await expect(service.removeProvider('my-gateway')).resolves.toBe(true);
      expect(providers).not.toHaveProperty('my-gateway');
    });
  });

  describe('getCustomAiProviderAccess', () => {
    it('reports the threshold alongside the current seat count', async () => {
      givenInstance({ seatCount: 42 });

      await expect(service.getCustomAiProviderAccess()).resolves.toEqual({
        hasAccess: false,
        seatCount: 42,
        seatThreshold: MAX_SEATS_WITHOUT_ENTERPRISE_KEY,
      });
    });
  });
});
