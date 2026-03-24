import { useStore } from 'jotai';

import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { agentChatUsageState } from '@/ai/states/agentChatUsageState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { currentAIChatThreadTitleState } from '@/ai/states/currentAIChatThreadTitleState';
import { shouldFocusChatEditorState } from '@/ai/states/shouldFocusChatEditorState';
import { hasTriggeredCreateForDraftState } from '@/ai/states/hasTriggeredCreateForDraftState';
import { threadIdCreatedFromDraftState } from '@/ai/states/threadIdCreatedFromDraftState';
import { useOpenAskAIPageInSidePanel } from '@/side-panel/hooks/useOpenAskAIPageInSidePanel';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useSwitchToNewAIChat = () => {
  const setThreadIdCreatedFromDraft = useSetAtomState(
    threadIdCreatedFromDraftState,
  );
  const [currentAIChatThread, setCurrentAIChatThread] = useAtomState(
    currentAIChatThreadState,
  );
  const setAgentChatInput = useSetAtomState(agentChatInputState);
  const setAgentChatUsage = useSetAtomState(agentChatUsageState);
  const setCurrentAIChatThreadTitle = useSetAtomState(
    currentAIChatThreadTitleState,
  );
  const setAgentChatDraftsByThreadId = useSetAtomState(
    agentChatDraftsByThreadIdState,
  );
  const store = useStore();
  const { openAskAIPage } = useOpenAskAIPageInSidePanel();

  const switchToNewChat = () => {
    setThreadIdCreatedFromDraft(null);
    const previousDraftKey = currentAIChatThread;
    const newChatDraft =
      store.get(agentChatDraftsByThreadIdState.atom)[
        AGENT_CHAT_NEW_THREAD_DRAFT_KEY
      ] ?? '';
    setAgentChatDraftsByThreadId((prev) => ({
      ...prev,
      [previousDraftKey]: store.get(agentChatInputState.atom),
    }));
    store.set(hasTriggeredCreateForDraftState.atom, false);
    setCurrentAIChatThread(AGENT_CHAT_NEW_THREAD_DRAFT_KEY);
    setAgentChatInput(newChatDraft);
    setCurrentAIChatThreadTitle(null);
    setAgentChatUsage(null);
    openAskAIPage();
    store.set(shouldFocusChatEditorState.atom, true);
  };

  return { switchToNewChat };
};
