import { useStore } from 'jotai';

import { useOpenExpandedAiChat } from '@/ai/expanded-chat/hooks/useOpenExpandedAiChat';
import { selectedInboxNotificationIdState } from '@/ai/expanded-chat/states/selectedInboxNotificationIdState';
import { useStartNewAiChatDraft } from '@/ai/hooks/useStartNewAiChatDraft';

// Transversal "New chat": starts a fresh draft and lands in the Inbox,
// from any screen.
export const useStartNewExpandedAiChat = () => {
  const store = useStore();
  const { startNewAiChatDraft } = useStartNewAiChatDraft();
  const { openExpandedAiChat, isOnExpandedAiChatPage } =
    useOpenExpandedAiChat();

  const startNewExpandedAiChat = () => {
    store.set(selectedInboxNotificationIdState.atom, null);
    startNewAiChatDraft({
      open: () => {
        if (!isOnExpandedAiChatPage) {
          openExpandedAiChat();
        }
      },
    });
  };

  return { startNewExpandedAiChat };
};
