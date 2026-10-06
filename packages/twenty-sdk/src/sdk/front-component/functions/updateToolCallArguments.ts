import { isDefined } from 'twenty-shared/utils';

import {
  frontComponentHostCommunicationApi,
  type UpdateToolCallArgumentsFunction,
} from '../globals/frontComponentHostCommunicationApi';

export const updateToolCallArguments: UpdateToolCallArgumentsFunction = (
  toolArguments: Record<string, unknown>,
) => {
  const updateToolCallArgumentsFunction =
    frontComponentHostCommunicationApi.updateToolCallArguments;

  if (!isDefined(updateToolCallArgumentsFunction)) {
    throw new Error('updateToolCallArgumentsFunction is not set');
  }

  return updateToolCallArgumentsFunction(toolArguments);
};
