import { useStore } from 'jotai';

import { useSwitchAgentChatThreadWithDraft } from '@/ai/hooks/useSwitchAgentChatThreadWithDraft';
import { useOpenExpandedAiChat } from '@/ai/expanded-chat/hooks/useOpenExpandedAiChat';
import { selectedInboxNotificationIdState } from '@/ai/expanded-chat/states/selectedInboxNotificationIdState';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { hasTriggeredCreateForDraftState } from '@/ai/states/hasTriggeredCreateForDraftState';
import { shouldFocusChatEditorState } from '@/ai/states/shouldFocusChatEditorState';
import { threadIdCreatedFromDraftState } from '@/ai/states/threadIdCreatedFromDraftState';

// Transversal "New chat": starts a fresh draft and lands in the Inbox,
// from any screen.
export const useStartNewExpandedAiChat = () => {
  const store = useStore();
  const { switchThreadWithDraft } = useSwitchAgentChatThreadWithDraft();
  const { openExpandedAiChat, isOnExpandedAiChatPage } =
    useOpenExpandedAiChat();

  const startNewExpandedAiChat = () => {
    store.set(threadIdCreatedFromDraftState.atom, null);
    store.set(hasTriggeredCreateForDraftState.atom, false);
    store.set(selectedInboxNotificationIdState.atom, null);
    switchThreadWithDraft(AGENT_CHAT_NEW_THREAD_DRAFT_KEY);
    if (!isOnExpandedAiChatPage) {
      openExpandedAiChat();
    }
    store.set(shouldFocusChatEditorState.atom, true);
  };

  return { startNewExpandedAiChat };
};
