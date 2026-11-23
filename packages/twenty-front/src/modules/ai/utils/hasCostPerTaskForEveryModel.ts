import { isDefined } from 'twenty-shared/utils';

import { type ClientAiModelConfig } from '~/generated-metadata/graphql';

export const hasCostPerTaskForEveryModel = (
  models: (Pick<ClientAiModelConfig, 'costPerTask'> | undefined)[],
): boolean =>
  models.every((model) => !isDefined(model) || isDefined(model.costPerTask));
