import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { isInboxMessageOwn } from '@/ai/utils/isInboxMessageOwn';

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

  return isInboxMessageOwn({
    message,
    currentWorkspaceMemberId,
    isSenderlessUserMessageOwn: false,
  });
};
