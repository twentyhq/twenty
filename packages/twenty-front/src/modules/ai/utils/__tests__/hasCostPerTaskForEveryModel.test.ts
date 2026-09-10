import { hasCostPerTaskForEveryModel } from '@/ai/utils/hasCostPerTaskForEveryModel';
import { type ClientAiModelConfig } from '~/generated-metadata/graphql';

const model = (
  overrides: Partial<ClientAiModelConfig> = {},
): ClientAiModelConfig =>
  ({
    modelId: 'openai/gpt-5.6-luna',
    label: 'GPT-5.6 Luna',
    sdkPackage: null,
    ...overrides,
  }) as ClientAiModelConfig;

describe('hasCostPerTaskForEveryModel', () => {
  it('is true when every resolved model carries a cost per task', () => {
    expect(
      hasCostPerTaskForEveryModel([
        model({ costPerTask: 0.1 }),
        model({ costPerTask: 2.3 }),
      ]),
    ).toBe(true);
  });

  it('is false as soon as one resolved model has no cost per task', () => {
    expect(
      hasCostPerTaskForEveryModel([model({ costPerTask: 0.1 }), model()]),
    ).toBe(false);
  });

  it('ignores tiers that resolved to no model', () => {
    expect(
      hasCostPerTaskForEveryModel([undefined, model({ costPerTask: 0.1 })]),
    ).toBe(true);
  });
});
