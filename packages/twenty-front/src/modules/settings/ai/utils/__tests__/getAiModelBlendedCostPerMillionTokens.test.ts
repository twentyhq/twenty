import { getAiModelBlendedCostPerMillionTokens } from '@/settings/ai/utils/getAiModelBlendedCostPerMillionTokens';

describe('getAiModelBlendedCostPerMillionTokens', () => {
  it('weights input three to one against output', () => {
    expect(
      getAiModelBlendedCostPerMillionTokens({
        inputCostPerMillionTokens: 2,
        outputCostPerMillionTokens: 12,
      }),
    ).toBe(4.5);
  });

  it('accepts a free input side as long as the model is not free', () => {
    expect(
      getAiModelBlendedCostPerMillionTokens({
        inputCostPerMillionTokens: 0,
        outputCostPerMillionTokens: 4,
      }),
    ).toBe(1);
  });

  it('returns undefined when a price is missing', () => {
    expect(
      getAiModelBlendedCostPerMillionTokens({
        inputCostPerMillionTokens: null,
        outputCostPerMillionTokens: 4,
      }),
    ).toBeUndefined();
    expect(
      getAiModelBlendedCostPerMillionTokens({
        inputCostPerMillionTokens: 2,
        outputCostPerMillionTokens: undefined,
      }),
    ).toBeUndefined();
  });

  it('returns undefined for a free model instead of a zero price', () => {
    expect(
      getAiModelBlendedCostPerMillionTokens({
        inputCostPerMillionTokens: 0,
        outputCostPerMillionTokens: 0,
      }),
    ).toBeUndefined();
  });
});
