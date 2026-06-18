import { useStore } from 'jotai';

import { useSwitchAgentChatThreadWithDraft } from '@/ai/hooks/useSwitchAgentChatThreadWithDraft';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { shouldFocusChatEditorState } from '@/ai/states/shouldFocusChatEditorState';
import { hasTriggeredCreateForDraftState } from '@/ai/states/hasTriggeredCreateForDraftState';
import { threadIdCreatedFromDraftState } from '@/ai/states/threadIdCreatedFromDraftState';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useSwitchToNewAiChat = () => {
  const setThreadIdCreatedFromDraft = useSetAtomState(
    threadIdCreatedFromDraftState,
  );
  const { switchThreadWithDraft } = useSwitchAgentChatThreadWithDraft();
  const store = useStore();
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();

  const switchToNewChat = () => {
    setThreadIdCreatedFromDraft(null);
    store.set(hasTriggeredCreateForDraftState.atom, false);
    switchThreadWithDraft(AGENT_CHAT_NEW_THREAD_DRAFT_KEY);
    openAskAiPage();
    store.set(shouldFocusChatEditorState.atom, true);
  };

  return { switchToNewChat };
};
