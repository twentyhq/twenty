import { useStore } from 'jotai';

import { useSwitchAgentChatThreadWithDraft } from '@/ai/hooks/useSwitchAgentChatThreadWithDraft';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { hasTriggeredCreateForDraftState } from '@/ai/states/hasTriggeredCreateForDraftState';
import { shouldFocusChatEditorState } from '@/ai/states/shouldFocusChatEditorState';
import { threadIdCreatedFromDraftState } from '@/ai/states/threadIdCreatedFromDraftState';

// Shared reset + draft-switch + focus sequence behind every "new chat"
// entry point; `open` decides which chat surface hosts the draft.
export const useStartNewAiChatDraft = () => {
  const store = useStore();
  const { switchThreadWithDraft } = useSwitchAgentChatThreadWithDraft();

  const startNewAiChatDraft = ({ open }: { open: () => void }) => {
    store.set(threadIdCreatedFromDraftState.atom, null);
    store.set(hasTriggeredCreateForDraftState.atom, false);
    switchThreadWithDraft(AGENT_CHAT_NEW_THREAD_DRAFT_KEY);
    open();
    store.set(shouldFocusChatEditorState.atom, true);
  };

  return { startNewAiChatDraft };
};
