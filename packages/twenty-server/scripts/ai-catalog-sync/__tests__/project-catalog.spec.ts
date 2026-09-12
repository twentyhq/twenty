import { type CatalogSpec } from '../types/catalog-spec.type';
import {
  type CanonicalCatalog,
  projectCatalog,
} from '../utils/project-catalog.util';

const canonicalCatalog: CanonicalCatalog = {
  openai: {
    npm: '@ai-sdk/openai',
    label: 'OpenAI',
    apiKey: '{{OPENAI_API_KEY}}',
    models: [
      {
        name: 'gpt-5.6-luna',
        label: 'GPT-5.6 Luna',
        inputCostPerMillionTokens: 0.2,
        outputCostPerMillionTokens: 1.2,
        cachedInputCostPerMillionTokens: 0.02,
        modalities: ['image', 'pdf'],
        efforts: ['low', 'medium', 'high'],
        benchmark: { intelligenceIndex: 37.5, measuredAt: '2026-09-11' },
        benchmarkByEffort: {
          high: { intelligenceIndex: 32.4, measuredAt: '2026-09-11' },
        },
      },
    ],
  },
  anthropic: {
    npm: '@ai-sdk/anthropic',
    label: 'Anthropic',
    apiKey: '{{ANTHROPIC_API_KEY}}',
    models: [{ name: 'claude-opus-4-7', label: 'Claude Opus 4.7' }],
  },
};

describe('projectCatalog', () => {
  it('describes a route from the catalog while keeping the route its own credentials', () => {
    const spec: CatalogSpec = {
      providers: [
        {
          name: 'azure-foundry',
          npm: '@ai-sdk/azure',
          label: 'Azure AI Foundry',
          apiKey: '{{AZURE_FOUNDRY_API_KEY}}',
          baseUrl: '{{AZURE_FOUNDRY_BASE_URL}}',
          dataResidency: 'eu',
          labelSuffix: ' (Azure)',
          models: ['gpt-5.6-luna'],
        },
      ],
    };

    const projected = projectCatalog({ canonicalCatalog, spec });

    expect(Object.keys(projected)).toEqual(['azure-foundry']);
    expect(projected['azure-foundry']).toMatchObject({
      npm: '@ai-sdk/azure',
      label: 'Azure AI Foundry',
      apiKey: '{{AZURE_FOUNDRY_API_KEY}}',
      baseUrl: '{{AZURE_FOUNDRY_BASE_URL}}',
    });
    expect(projected['azure-foundry'].models?.[0]).toEqual({
      name: 'gpt-5.6-luna',
      label: 'GPT-5.6 Luna (Azure)',
      inputCostPerMillionTokens: 0.2,
      outputCostPerMillionTokens: 1.2,
      cachedInputCostPerMillionTokens: 0.02,
      modalities: ['image', 'pdf'],
      efforts: ['low', 'medium', 'high'],
      benchmark: { intelligenceIndex: 37.5, measuredAt: '2026-09-11' },
      benchmarkByEffort: {
        high: { intelligenceIndex: 32.4, measuredAt: '2026-09-11' },
      },
      dataResidency: 'eu',
    });
  });

  it('serves a model under the id the route deploys it as', () => {
    const spec: CatalogSpec = {
      providers: [
        {
          name: 'amazon-bedrock',
          npm: '@ai-sdk/amazon-bedrock',
          region: 'eu-central-1',
          models: [
            { model: 'claude-opus-4-7', as: 'eu.anthropic.claude-opus-4-7' },
          ],
        },
      ],
    };

    const projected = projectCatalog({ canonicalCatalog, spec });

    expect(projected['amazon-bedrock'].models?.[0]).toMatchObject({
      name: 'eu.anthropic.claude-opus-4-7',
      label: 'Claude Opus 4.7',
    });
    expect(projected['amazon-bedrock'].region).toBe('eu-central-1');
  });

  it('takes a price the route negotiated and leaves the rest of the reading alone', () => {
    const spec: CatalogSpec = {
      providers: [
        {
          name: 'azure-foundry',
          npm: '@ai-sdk/azure',
          models: [
            { model: 'gpt-5.6-luna', cachedInputCostPerMillionTokens: 0.5 },
          ],
        },
      ],
    };

    const projected = projectCatalog({ canonicalCatalog, spec });

    expect(projected['azure-foundry'].models?.[0]).toMatchObject({
      cachedInputCostPerMillionTokens: 0.5,
      inputCostPerMillionTokens: 0.2,
      efforts: ['low', 'medium', 'high'],
    });
  });

  it('refuses a spec naming a model the catalog does not carry', () => {
    const spec: CatalogSpec = {
      providers: [
        {
          name: 'azure-foundry',
          npm: '@ai-sdk/azure',
          models: ['gpt-5.6-luna', 'gpt-9-imaginary'],
        },
      ],
    };

    expect(() => projectCatalog({ canonicalCatalog, spec })).toThrow(
      'azure-foundry/gpt-9-imaginary',
    );
  });

  it('cannot restate what a model is, only which models a route serves', () => {
    const spec = {
      providers: [
        {
          name: 'azure-foundry',
          npm: '@ai-sdk/azure',
          models: [{ model: 'gpt-5.6-luna', modalities: ['image'] }],
        },
      ],
    } as unknown as CatalogSpec;

    const projected = projectCatalog({ canonicalCatalog, spec });

    expect(projected['azure-foundry'].models?.[0]).toMatchObject({
      modalities: ['image', 'pdf'],
    });
  });
});
