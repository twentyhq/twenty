import { scrollAiChatToBottom } from '@/ai/utils/scrollAiChatToBottom';
import { useLayoutEffect } from 'react';

// Scrolls to the bottom on mount of the message list. Used when the AI
// chat side panel remounts (close + reopen): the displayed thread is
// unchanged, so the thread-change flag flow does not trigger and the
// freshly created scroll wrapper would otherwise paint at the top.
//
// Direct DOM scroll on purpose — going through the
// agentChatIsInitialScrollPendingOnThreadChange flag would also activate
// the MutationObserver-based settle in
// AgentChatScrollToBottomOnDisplayedThreadChangeLayoutEffect, which never
// finishes during streaming and would leave the chat hidden for the
// duration of the stream.
export const AgentChatScrollToBottomOnMountLayoutEffect = () => {
  useLayoutEffect(() => {
    scrollAiChatToBottom();
  }, []);

  return null;
};
