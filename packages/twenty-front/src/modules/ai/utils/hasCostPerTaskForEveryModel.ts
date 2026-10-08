import { isDefined } from 'twenty-shared/utils';

import { type ClientAiModelConfig } from '~/generated-metadata/graphql';

// Cost per task and price per token aren't comparable across tiers.
export const hasCostPerTaskForEveryModel = (
  models: (Pick<ClientAiModelConfig, 'costPerTask'> | undefined)[],
): boolean =>
  models.every((model) => !isDefined(model) || isDefined(model.costPerTask));
