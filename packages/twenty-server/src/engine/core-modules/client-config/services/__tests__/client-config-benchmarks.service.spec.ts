import { Test } from '@nestjs/testing';

import { MaintenanceModeService } from 'src/engine/core-modules/admin-panel/maintenance-mode.service';
import { ClientConfigService } from 'src/engine/core-modules/client-config/services/client-config.service';
import { DomainServerConfigService } from 'src/engine/core-modules/domain/domain-server-config/services/domain-server-config.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { ArtificialAnalysisCatalogService } from 'src/engine/metadata-modules/ai/ai-models/services/artificial-analysis-catalog.service';

const registeredModel = {
  modelId: 'openai/gpt-4o-mini',
  providerName: 'openai',
  sdkPackage: '@ai-sdk/openai',
};
const modelConfig = {
  label: 'GPT-4o mini',
  inputCostPerMillionTokens: 0.15,
  outputCostPerMillionTokens: 0.6,
  contextWindowTokens: 128_000,
};
const catalog = {
  models: [
    {
      id: 'stable-id',
      name: 'GPT-4o mini',
      slug: 'gpt-4o-mini',
      evaluations: { artificial_analysis_intelligence_index: 30 },
      performance: { median_output_tokens_per_second: 100 },
      artificial_analysis_intelligence_index_cost: {
        cost_per_task: { total_cost: 0.1678 },
      },
    },
  ],
  intelligenceIndexVersion: 4.3,
  fetchedAt: '2026-09-08T12:00:00.000Z',
};

describe('ClientConfigService model benchmarks', () => {
  const getCatalog = jest.fn();
  let service: ClientConfigService;

  beforeEach(async () => {
    getCatalog.mockResolvedValue(catalog);
    const module = await Test.createTestingModule({
      providers: [
        ClientConfigService,
        { provide: TwentyConfigService, useValue: { get: () => undefined } },
        {
          provide: MaintenanceModeService,
          useValue: { getMaintenanceMode: async () => undefined },
        },
        {
          provide: DomainServerConfigService,
          useValue: {
            getFrontUrl: () => new URL('http://localhost:3001'),
            getPublicBaseHostnameOrUndefined: () => undefined,
          },
        },
        { provide: ArtificialAnalysisCatalogService, useValue: { getCatalog } },
        {
          provide: AiModelRegistryService,
          useValue: {
            getAdminFilteredModels: () => [registeredModel],
            getRecommendedModelIds: () => new Set([registeredModel.modelId]),
            getResolvedProvidersForAdmin: () => ({
              openai: { label: 'OpenAI' },
            }),
            getModelConfig: () => modelConfig,
            getDefaultSpeedModel: () => registeredModel,
            getDefaultPerformanceModel: () => registeredModel,
          },
        },
      ],
    }).compile();
    service = module.get(ClientConfigService);
  });

  it('enriches regular and automatic selections while preserving billing prices', async () => {
    const config = await service.getClientConfig();
    expect(config.aiModels).toHaveLength(3);
    for (const model of config.aiModels) {
      expect(model.benchmark).toEqual({
        modelId: 'stable-id',
        modelName: 'GPT-4o mini',
        modelSlug: 'gpt-4o-mini',
        intelligenceIndex: 30,
        outputTokensPerSecond: 100,
        costPerTask: 0.1678,
        intelligenceIndexVersion: 4.3,
        fetchedAt: catalog.fetchedAt,
      });
      expect(model.inputCostPerMillionTokens).toBe(0.15);
      expect(model.outputCostPerMillionTokens).toBe(0.6);
      expect(model.contextWindowTokens).toBe(128_000);
    }
  });

  it('still returns model selection when benchmarks are unavailable', async () => {
    getCatalog.mockResolvedValue(undefined);
    const config = await service.getClientConfig();
    expect(config.aiModels).toHaveLength(3);
    expect(
      config.aiModels.every((model) => model.benchmark === undefined),
    ).toBe(true);
  });
});
