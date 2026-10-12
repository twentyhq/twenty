import { isDefined } from 'twenty-shared/utils';
import { type ClientAiModelConfig } from '~/generated-metadata/graphql';

// Artificial Analysis's 3:1 input/output blend, so the number matches their site.
const INPUT_WEIGHT = 3;
const OUTPUT_WEIGHT = 1;

export const getAiModelBlendedCostPerMillionTokens = (
  model: Pick<
    ClientAiModelConfig,
    'inputCostPerMillionTokens' | 'outputCostPerMillionTokens'
  >,
): number | undefined => {
  const { inputCostPerMillionTokens, outputCostPerMillionTokens } = model;

  if (
    !isDefined(inputCostPerMillionTokens) ||
    !isDefined(outputCostPerMillionTokens) ||
    inputCostPerMillionTokens + outputCostPerMillionTokens <= 0
  ) {
    return undefined;
  }

  return (
    (inputCostPerMillionTokens * INPUT_WEIGHT +
      outputCostPerMillionTokens * OUTPUT_WEIGHT) /
    (INPUT_WEIGHT + OUTPUT_WEIGHT)
  );
};
