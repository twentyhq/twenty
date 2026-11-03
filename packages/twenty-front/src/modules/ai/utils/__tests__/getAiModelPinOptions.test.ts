import { getAiModelPinOptions } from '@/ai/utils/getAiModelPinOptions';

const aiModels = [
  { modelId: 'openai/luna', label: 'GPT-6 Luna' },
  { modelId: 'openai/sol', label: 'GPT-6.1 Sol' },
];

describe('getAiModelPinOptions', () => {
  it('lists only available models when nothing is pinned', () => {
    expect(
      getAiModelPinOptions({ aiModels, keepModelId: '' }).map(
        (option) => option.label,
      ),
    ).toEqual(['GPT-6 Luna', 'GPT-6.1 Sol']);
  });

  it('keeps a pinned model that is no longer available', () => {
    expect(
      getAiModelPinOptions({ aiModels, keepModelId: 'openai/retired' }),
    ).toContainEqual({
      value: 'openai/retired',
      label: 'openai/retired (unavailable)',
    });
  });
});
