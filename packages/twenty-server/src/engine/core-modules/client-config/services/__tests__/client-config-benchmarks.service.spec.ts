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
    {
      id: 'smart-id',
      name: 'Smart model',
      slug: 'smart-model',
      evaluations: { artificial_analysis_intelligence_index: 60 },
      performance: { median_output_tokens_per_second: 40 },
    },
    {
      id: 'fast-id',
      name: 'Fast model',
      slug: 'fast-model',
      evaluations: { artificial_analysis_intelligence_index: 20 },
      performance: { median_output_tokens_per_second: 200 },
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
            getModelConfig: (modelId: string) => ({
              ...modelConfig,
              label:
                modelId === 'smart'
                  ? 'Smart model'
                  : modelId === 'fast'
                    ? 'Fast model'
                    : modelConfig.label,
            }),
            getDefaultSpeedModel: () => ({
              ...registeredModel,
              modelId: 'fast',
            }),
            getDefaultPerformanceModel: () => ({
              ...registeredModel,
              modelId: 'smart',
            }),
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
      const expected = catalog.models.find(
        (entry) => entry.name === model.label,
      )!;
      expect(model.benchmark).toEqual({
        modelId: expected.id,
        modelName: expected.name,
        modelSlug: expected.slug,
        intelligenceIndex:
          expected.evaluations.artificial_analysis_intelligence_index,
        outputTokensPerSecond:
          expected.performance.median_output_tokens_per_second,
        costPerTask:
          expected.artificial_analysis_intelligence_index_cost?.cost_per_task
            .total_cost,
        intelligenceIndexVersion: 4.3,
        fetchedAt: catalog.fetchedAt,
      });
      expect(model.inputCostPerMillionTokens).toBe(0.15);
      expect(model.outputCostPerMillionTokens).toBe(0.6);
      expect(model.contextWindowTokens).toBe(128_000);
    }
  });

  it('enriches only the models present in a partial catalog', async () => {
    getCatalog.mockResolvedValue({ ...catalog, models: [catalog.models[1]] });
    const config = await service.getClientConfig();
    expect(
      config.aiModels
        .filter((model) => model.benchmark)
        .map((model) => model.label),
    ).toEqual(['Smart model']);
    expect(config.aiModels).toHaveLength(3);
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
