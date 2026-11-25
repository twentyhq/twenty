import { getAiModelPinOptions } from '@/ai/utils/getAiModelPinOptions';

describe('getAiModelPinOptions', () => {
  it('keeps the current deprecated model and excludes other deprecated models and effort variants', () => {
    const options = getAiModelPinOptions({
      aiModels: [
        { modelId: 'story/current', label: 'Current', isDeprecated: true },
        { modelId: 'story/older', label: 'Older', isDeprecated: true },
        { modelId: 'story/available', label: 'Available' },
        {
          modelId: 'story/available@high',
          label: 'Available High',
          effort: 'high',
        },
      ],
      keepModelId: 'story/current',
    });

    expect(options.map(({ value }) => value)).toEqual([
      'story/available',
      'story/current',
    ]);
    expect(options.find(({ value }) => value === 'story/current')?.label).toBe(
      'Current (deprecated)',
    );
  });

  it('preserves a missing current model as an unavailable choice', () => {
    const options = getAiModelPinOptions({
      aiModels: [{ modelId: 'story/available', label: 'Available' }],
      keepModelId: 'story/retired',
    });

    expect(options).toContainEqual({
      value: 'story/retired',
      label: 'story/retired (unavailable)',
      disabled: true,
    });
  });
});
