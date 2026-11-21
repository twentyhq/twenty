import { useEffect } from 'react';

import { aiChatThreadDisplayedMessagesFamilyState } from '@/ai-chat/states/display/aiChatThreadDisplayedMessagesFamilyState';
import { aiChatThreadReplyStatusFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyStatusFamilyState';
import { aiChatThreadFetchedMessagesFamilyState } from '@/ai-chat/states/server/aiChatThreadFetchedMessagesFamilyState';
import { aiChatThreadIsFetchingMessagesFamilyState } from '@/ai-chat/states/server/aiChatThreadIsFetchingMessagesFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

type AiChatThreadDisplayedMessagesEffectProps = {
  threadId: string;
};

export const AiChatThreadDisplayedMessagesEffect = ({
  threadId,
}: AiChatThreadDisplayedMessagesEffectProps) => {
  const aiChatThreadFetchedMessages = useAtomFamilyStateValue(
    aiChatThreadFetchedMessagesFamilyState,
    { threadId },
  );

  const aiChatThreadReplyStatus = useAtomFamilyStateValue(
    aiChatThreadReplyStatusFamilyState,
    { threadId },
  );

  const aiChatThreadIsFetchingMessages = useAtomFamilyStateValue(
    aiChatThreadIsFetchingMessagesFamilyState,
    { threadId },
  );

  const setAiChatThreadDisplayedMessages = useSetAtomFamilyState(
    aiChatThreadDisplayedMessagesFamilyState,
    { threadId },
  );

  useEffect(() => {
    if (aiChatThreadReplyStatus !== 'idle' || aiChatThreadIsFetchingMessages) {
      return;
    }

    setAiChatThreadDisplayedMessages(aiChatThreadFetchedMessages.messages);
  }, [
    aiChatThreadFetchedMessages,
    aiChatThreadReplyStatus,
    aiChatThreadIsFetchingMessages,
    setAiChatThreadDisplayedMessages,
  ]);

  return null;
};
