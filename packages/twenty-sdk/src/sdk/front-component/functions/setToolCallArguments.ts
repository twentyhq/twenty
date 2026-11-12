import { isDefined } from 'twenty-shared/utils';

import {
  frontComponentHostCommunicationApi,
  type SetToolCallArgumentsFunction,
} from '../globals/frontComponentHostCommunicationApi';

export const setToolCallArguments: SetToolCallArgumentsFunction = (
  toolArguments,
) => {
  const setToolCallArgumentsFunction =
    frontComponentHostCommunicationApi.setToolCallArguments;

  if (!isDefined(setToolCallArgumentsFunction)) {
    throw new Error('setToolCallArgumentsFunction is not set');
  }

  return setToolCallArgumentsFunction(toolArguments);
};
