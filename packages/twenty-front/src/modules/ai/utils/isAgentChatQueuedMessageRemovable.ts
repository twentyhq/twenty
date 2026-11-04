import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { isAgentChatMessageOwn } from '@/ai/utils/isAgentChatMessageOwn';

type IsAgentChatQueuedMessageRemovableParams = {
  message: Pick<ExtendedUIMessage, 'role' | 'metadata'>;
  currentWorkspaceMemberId: string | undefined;
  isAiChatInboxEnabled: boolean;
  isReadOnly: boolean;
};

export const isAgentChatQueuedMessageRemovable = ({
  message,
  currentWorkspaceMemberId,
  isAiChatInboxEnabled,
  isReadOnly,
}: IsAgentChatQueuedMessageRemovableParams) => {
  if (isReadOnly) {
    return false;
  }

  if (!isAiChatInboxEnabled) {
    return true;
  }

  return isAgentChatMessageOwn({
    message,
    currentWorkspaceMemberId,
    isSenderlessUserMessageOwn: false,
  });
};
