import { isDefined } from 'twenty-shared/utils';

import {
  frontComponentHostCommunicationApi,
  type OpenAskAIWithPromptFunction,
} from '../globals/frontComponentHostCommunicationApi';

export const openAskAIWithPrompt: OpenAskAIWithPromptFunction = (params) => {
  const openAskAIWithPromptFunction =
    frontComponentHostCommunicationApi.openAskAIWithPrompt;

  if (!isDefined(openAskAIWithPromptFunction)) {
    throw new Error('openAskAIWithPromptFunction is not set');
  }

  return openAskAIWithPromptFunction(params);
};
