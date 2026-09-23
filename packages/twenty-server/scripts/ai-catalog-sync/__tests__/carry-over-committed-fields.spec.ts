import { type GeneratedCatalog } from '../types/generated-catalog.type';
import { type GeneratedModel } from '../types/generated-model.type';
import { carryOverCommittedFields } from '../utils/carry-over-committed-fields.util';

const openai = (models: GeneratedModel[]): GeneratedCatalog => ({
  openai: { models },
});

describe('carryOverCommittedFields', () => {
  it('restores the fields models.dev does not carry, and only those', () => {
    const catalog = openai([
      { name: 'gpt-x', label: 'GPT X', supportsReasoning: true },
    ]);

    carryOverCommittedFields({
      catalog,
      committedCatalog: openai([
        {
          name: 'gpt-x',
          label: 'Old label',
          inputCostPerMillionTokens: 1,
          efforts: ['low', 'high'],
          dataResidency: 'us',
          zeroDataRetention: true,
        },
      ]),
    });

    expect(catalog.openai.models[0]).toEqual({
      name: 'gpt-x',
      label: 'GPT X',
      supportsReasoning: true,
      efforts: ['low', 'high'],
      dataResidency: 'us',
      zeroDataRetention: true,
    });
  });

  it('leaves a model the committed catalog does not know untouched', () => {
    const catalog = openai([{ name: 'gpt-new', label: 'GPT New' }]);

    carryOverCommittedFields({
      catalog,
      committedCatalog: openai([
        { name: 'gpt-x', label: 'GPT X', efforts: ['low'] },
      ]),
    });

    expect(catalog.openai.models[0]).toEqual({
      name: 'gpt-new',
      label: 'GPT New',
    });
  });
});
