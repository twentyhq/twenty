import { isNonEmptyArray } from 'twenty-shared/utils';

import { type ClientAiModelConfig } from '~/generated-metadata/graphql';

export const getCanSendAiChatMessage = ({
  aiModels,
  isAiChatInboxEnabled,
}: {
  aiModels: ClientAiModelConfig[];
  isAiChatInboxEnabled: boolean;
}) => isNonEmptyArray(aiModels) || isAiChatInboxEnabled;
