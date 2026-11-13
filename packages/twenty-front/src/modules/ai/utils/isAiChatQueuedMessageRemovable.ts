import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { isAiChatMessageOwn } from '@/ai/utils/isAiChatMessageOwn';

type IsAiChatQueuedMessageRemovableParams = {
  message: Pick<ExtendedUIMessage, 'role' | 'metadata'>;
  currentWorkspaceMemberId: string | undefined;
  isAiChatInboxEnabled: boolean;
  isReadOnly: boolean;
};

export const isAiChatQueuedMessageRemovable = ({
  message,
  currentWorkspaceMemberId,
  isAiChatInboxEnabled,
  isReadOnly,
}: IsAiChatQueuedMessageRemovableParams) => {
  if (isReadOnly) {
    return false;
  }

  if (!isAiChatInboxEnabled) {
    return true;
  }

  return isAiChatMessageOwn({
    message,
    currentWorkspaceMemberId,
    isSenderlessUserMessageOwn: false,
  });
};
