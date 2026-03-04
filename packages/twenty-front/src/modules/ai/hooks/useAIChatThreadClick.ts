import { useStore } from 'jotai';
import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { agentChatUsageState } from '@/ai/states/agentChatUsageState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { currentAIChatThreadTitleState } from '@/ai/states/currentAIChatThreadTitleState';
import { useOpenAskAIPageInCommandMenu } from '@/command-menu/hooks/useOpenAskAIPageInCommandMenu';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { type AgentChatThread } from '~/generated-metadata/graphql';

export type UseAIChatThreadClickOptions = {
  resetNavigationStack?: boolean;
};

export const useAIChatThreadClick = (
  options: UseAIChatThreadClickOptions = {},
) => {
  const { resetNavigationStack = false } = options;
  const [currentAIChatThread, setCurrentAIChatThread] = useAtomState(
    currentAIChatThreadState,
  );
  const agentChatInput = useAtomStateValue(agentChatInputState);
  const setAgentChatInput = useSetAtomState(agentChatInputState);
  const setCurrentAIChatThreadTitle = useSetAtomState(
    currentAIChatThreadTitleState,
  );
  const setAgentChatUsage = useSetAtomState(agentChatUsageState);
  const setAgentChatDraftsByThreadId = useSetAtomState(
    agentChatDraftsByThreadIdState,
  );
  const store = useStore();
  const { openAskAIPage } = useOpenAskAIPageInCommandMenu();

  const handleThreadClick = (thread: AgentChatThread) => {
    const previousDraftKey =
      currentAIChatThread ?? AGENT_CHAT_NEW_THREAD_DRAFT_KEY;
    const isSameThread = thread.id === currentAIChatThread;

    setAgentChatDraftsByThreadId((prev) => ({
      ...prev,
      [previousDraftKey]: agentChatInput,
    }));
    setCurrentAIChatThread(thread.id);

    if (!isSameThread) {
      const newDraft =
        store.get(agentChatDraftsByThreadIdState.atom)[thread.id] ?? '';
      setAgentChatInput(newDraft);
    }

    setCurrentAIChatThreadTitle(thread.title ?? null);

    const hasUsageData =
      (thread.conversationSize ?? 0) > 0 &&
      isDefined(thread.contextWindowTokens);
    setAgentChatUsage(
      hasUsageData
        ? {
            lastMessage: null,
            conversationSize: thread.conversationSize ?? 0,
            contextWindowTokens: thread.contextWindowTokens ?? 0,
            inputTokens: thread.totalInputTokens,
            outputTokens: thread.totalOutputTokens,
            inputCredits: thread.totalInputCredits,
            outputCredits: thread.totalOutputCredits,
          }
        : null,
    );

    openAskAIPage({
      resetNavigationStack,
    });
  };

  return { handleThreadClick };
};
