import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useMarkAiChatThreadRead } from '@/ai/hooks/useMarkAiChatThreadRead';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// Mounted with the message list rather than by a page, so every surface that
// shows a conversation records it as read: the side panel and the standalone
// chat show one too. The newest message is part of what the cursor follows, so
// a thread that grows while it is open is marked read again instead of staying
// on the cursor it had when it was opened.
export const AiChatMarkThreadReadEffect = () => {
  const agentChatDisplayedThread = useAtomStateValue(
    agentChatDisplayedThreadState,
  );
  const agentChatMessages = useAtomComponentFamilyStateValue(
    agentChatMessagesComponentFamilyState,
    { threadId: agentChatDisplayedThread },
  );
  const { markAiChatThreadRead } = useMarkAiChatThreadRead();

  const lastMessageId = agentChatMessages.at(-1)?.id;

  useEffect(() => {
    if (!isDefined(agentChatDisplayedThread) || !isDefined(lastMessageId)) {
      return;
    }

    void markAiChatThreadRead(agentChatDisplayedThread);
    // markAiChatThreadRead is rebuilt on every render, so it is deliberately
    // not a dependency: the read is keyed on which thread is open and how far
    // it has got, not on the identity of the function that records it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentChatDisplayedThread, lastMessageId]);

  return null;
};
