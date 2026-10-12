/* @license Enterprise */

import { Test, type TestingModule } from '@nestjs/testing';

import { AdminPanelExceptionCode } from 'src/engine/core-modules/admin-panel/admin-panel.exception';
import { AdminPanelAiProviderService } from 'src/engine/core-modules/admin-panel/services/admin-panel-ai-provider.service';
import { CustomAiProviderAccessService } from 'src/engine/core-modules/enterprise/services/custom-ai-provider-access.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { DefaultAiCatalogService } from 'src/engine/metadata-modules/ai/ai-models/services/default-ai-catalog.service';

const CATALOG_PROVIDER_NAME = 'openai';
const CUSTOM_PROVIDER_NAME = 'openai-eu';

const CATALOG_PROVIDER = {
  npm: '@ai-sdk/openai',
  apiKey: '{{OPENAI_API_KEY}}',
};

const RESOLVED_CATALOG_PROVIDER = {
  ...CATALOG_PROVIDER,
  apiKey: 'sk-catalog-key',
};

const CUSTOM_PROVIDER = {
  npm: '@ai-sdk/openai',
  apiKey: 'sk-custom-key',
};

describe('AdminPanelAiProviderService', () => {
  let service: AdminPanelAiProviderService;
  let customProviders: Record<string, unknown>;
  let setConfigVariable: jest.Mock;

  beforeEach(async () => {
    customProviders = {};
    setConfigVariable = jest.fn().mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminPanelAiProviderService,
        {
          provide: TwentyConfigService,
          useValue: { get: () => customProviders, set: setConfigVariable },
        },
        {
          provide: CustomAiProviderAccessService,
          useValue: {
            computeAccess: jest.fn().mockResolvedValue({ hasAccess: true }),
          },
        },
        {
          provide: AiModelRegistryService,
          useValue: {
            getCatalogProviderNames: () => new Set([CATALOG_PROVIDER_NAME]),
            getResolvedProvidersForAdmin: () => ({
              [CATALOG_PROVIDER_NAME]: RESOLVED_CATALOG_PROVIDER,
              ...customProviders,
            }),
          },
        },
        {
          provide: DefaultAiCatalogService,
          useValue: {
            getDefaultAiCatalog: () => ({
              [CATALOG_PROVIDER_NAME]: CATALOG_PROVIDER,
            }),
          },
        },
      ],
    }).compile();

    service = module.get(AdminPanelAiProviderService);
  });

  describe('addProvider', () => {
    it('should reject a built-in provider name', async () => {
      await expect(
        service.addProvider({
          providerName: CATALOG_PROVIDER_NAME,
          providerConfig: CUSTOM_PROVIDER,
        }),
      ).rejects.toMatchObject({
        message: `Provider "${CATALOG_PROVIDER_NAME}" is built in and cannot be added as a custom provider`,
        extensions: {
          subCode: AdminPanelExceptionCode.BUILT_IN_AI_PROVIDER_NAME,
        },
      });
      expect(setConfigVariable).not.toHaveBeenCalled();
    });

    it('should save a provider whose name is not built in', async () => {
      await service.addProvider({
        providerName: CUSTOM_PROVIDER_NAME,
        providerConfig: CUSTOM_PROVIDER,
      });

      expect(setConfigVariable).toHaveBeenCalledWith('AI_PROVIDERS', {
        [CUSTOM_PROVIDER_NAME]: expect.objectContaining(CUSTOM_PROVIDER),
      });
    });
  });

  describe('getMaskedProviders', () => {
    it('should report an AI_PROVIDERS entry with a built-in name as custom', () => {
      customProviders = { [CATALOG_PROVIDER_NAME]: CUSTOM_PROVIDER };

      const provider = service.getMaskedProviders()[CATALOG_PROVIDER_NAME];

      expect(provider).toMatchObject({ source: 'custom' });
      expect(provider).not.toHaveProperty('apiKeyConfigVariable');
    });

    it('should report a built-in provider as catalog with its config variable', () => {
      expect(service.getMaskedProviders()[CATALOG_PROVIDER_NAME]).toMatchObject(
        {
          source: 'catalog',
          apiKeyConfigVariable: 'OPENAI_API_KEY',
        },
      );
    });
  });
});
