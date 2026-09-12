import { isDefined } from 'twenty-shared/utils';

import { type ClientAiModelConfig } from '~/generated-metadata/graphql';

// The 3:1 input to output split Artificial Analysis uses for its blended price,
// so the number lines up with what a reader will find on their site.
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
