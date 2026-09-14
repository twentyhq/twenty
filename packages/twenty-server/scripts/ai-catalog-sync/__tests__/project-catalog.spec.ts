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

  it('takes a limit the route caps below the one the model allows', () => {
    const spec: CatalogSpec = {
      providers: [
        {
          name: 'amazon-bedrock',
          npm: '@ai-sdk/amazon-bedrock',
          models: [{ model: 'gpt-5.6-luna', maxOutputTokens: 64000 }],
        },
      ],
    };

    const projected = projectCatalog({ canonicalCatalog, spec });

    expect(projected['amazon-bedrock'].models?.[0]).toMatchObject({
      maxOutputTokens: 64000,
    });
  });

  it('serves every model a vendor publishes when the spec names the vendor', () => {
    const spec: CatalogSpec = {
      providers: [
        {
          name: 'openai',
          npm: '@ai-sdk/openai',
          apiKey: '{{OPENAI_API_KEY}}',
          models: { vendor: 'openai' },
        },
      ],
    };

    const projected = projectCatalog({ canonicalCatalog, spec });

    expect(projected['openai'].models?.map((model) => model.name)).toEqual([
      'gpt-5.6-luna',
    ]);
    expect(projected['openai'].models?.[0]).toMatchObject({
      efforts: ['low', 'medium', 'high'],
    });
  });

  it('refuses a spec naming a vendor the catalog does not carry', () => {
    const spec: CatalogSpec = {
      providers: [
        {
          name: 'openai',
          npm: '@ai-sdk/openai',
          models: { vendor: 'openai-imaginary' },
        },
      ],
    };

    expect(() => projectCatalog({ canonicalCatalog, spec })).toThrow(
      'which the catalog does not carry',
    );
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

  it('refuses a repeated provider, which would drop the first one silently', () => {
    const spec: CatalogSpec = {
      providers: [
        {
          name: 'azure-foundry',
          npm: '@ai-sdk/azure',
          models: ['gpt-5.6-luna'],
        },
        {
          name: 'azure-foundry',
          npm: '@ai-sdk/azure',
          models: ['claude-opus-4-7'],
        },
      ],
    };

    expect(() => projectCatalog({ canonicalCatalog, spec })).toThrow(
      'repeated or reserved',
    );
  });

  it('refuses an SDK package or residency the server would not parse', () => {
    const withNpm = (npm: string): CatalogSpec => ({
      providers: [{ name: 'gateway', npm, models: ['gpt-5.6-luna'] }],
    });

    expect(() =>
      projectCatalog({ canonicalCatalog, spec: withNpm('@ai-sdk/imaginary') }),
    ).toThrow('unsupported SDK package');

    expect(() =>
      projectCatalog({
        canonicalCatalog,
        spec: {
          providers: [
            {
              name: 'gateway',
              npm: '@ai-sdk/openai',
              dataResidency: 'mars',
              models: ['gpt-5.6-luna'],
            },
          ],
        },
      }),
    ).toThrow('unsupported data residency');
  });

  it('refuses a negotiated price that is not a usable number', () => {
    const spec: CatalogSpec = {
      providers: [
        {
          name: 'azure-foundry',
          npm: '@ai-sdk/azure',
          models: [{ model: 'gpt-5.6-luna', inputCostPerMillionTokens: -1 }],
        },
      ],
    };

    expect(() => projectCatalog({ canonicalCatalog, spec })).toThrow(
      'which is not a usable number',
    );
  });

  it('marks the route on a label the spec overrides', () => {
    const spec: CatalogSpec = {
      providers: [
        {
          name: 'azure-foundry',
          npm: '@ai-sdk/azure',
          labelSuffix: ' (Azure)',
          models: [{ model: 'gpt-5.6-luna', label: 'Luna' }],
        },
      ],
    };

    const projected = projectCatalog({ canonicalCatalog, spec });

    expect(projected['azure-foundry'].models?.[0]?.label).toBe('Luna (Azure)');
  });
});
