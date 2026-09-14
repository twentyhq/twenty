import { isDefined } from 'twenty-shared/utils';

import { type ClientAiModelConfig } from '~/generated-metadata/graphql';

// Cost per task and price per token are different bases, so a comparison
// across tiers uses cost per task only when every resolved model has one.
export const hasCostPerTaskForEveryModel = (
  models: (Pick<ClientAiModelConfig, 'costPerTask'> | undefined)[],
): boolean =>
  models.every((model) => !isDefined(model) || isDefined(model.costPerTask));
