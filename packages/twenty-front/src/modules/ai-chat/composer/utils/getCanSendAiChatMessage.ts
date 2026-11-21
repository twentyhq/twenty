import { isNonEmptyArray } from 'twenty-shared/utils';

export const getCanSendAiChatMessage = ({
  aiModels,
  isAiChatInboxEnabled,
}: {
  aiModels: unknown[];
  isAiChatInboxEnabled: boolean;
}) => isNonEmptyArray(aiModels) || isAiChatInboxEnabled;
