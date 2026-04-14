import { agentChatDraftsByThreadIdState } from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { agentChatUsageComponentFamilyState } from '@/ai/states/agentChatUsageComponentFamilyState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { currentAIChatThreadTitleComponentFamilyState } from '@/ai/states/currentAIChatThreadTitleComponentFamilyState';
import { threadIdCreatedFromDraftState } from '@/ai/states/threadIdCreatedFromDraftState';
import { useOpenAskAIPageInSidePanel } from '@/side-panel/hooks/useOpenAskAIPageInSidePanel';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { type AgentChatThread } from '~/generated-metadata/graphql';

export type UseAIChatThreadClickOptions = {
  resetNavigationStack?: boolean;
};

export const useAIChatThreadClick = (
  options: UseAIChatThreadClickOptions = {},
) => {
  const { resetNavigationStack = false } = options;
  const setThreadIdCreatedFromDraft = useSetAtomState(
    threadIdCreatedFromDraftState,
  );
  const [currentAIChatThread, setCurrentAIChatThread] = useAtomState(
    currentAIChatThreadState,
  );
  const setAgentChatInput = useSetAtomState(agentChatInputState);
  const setAgentChatDraftsByThreadId = useSetAtomState(
    agentChatDraftsByThreadIdState,
  );
  const threadTitleFamilyCallback = useAtomComponentFamilyStateCallbackState(
    currentAIChatThreadTitleComponentFamilyState,
  );
  const agentChatUsageFamilyCallback = useAtomComponentFamilyStateCallbackState(
    agentChatUsageComponentFamilyState,
  );
  const store = useStore();
  const { openAskAIPage } = useOpenAskAIPageInSidePanel();

  const handleThreadClick = (thread: AgentChatThread) => {
    setThreadIdCreatedFromDraft(null);
    const isSameThread = thread.id === currentAIChatThread;

    if (currentAIChatThread !== null) {
      setAgentChatDraftsByThreadId((prev) => ({
        ...prev,
        [currentAIChatThread]: store.get(agentChatInputState.atom),
      }));
    }
    setCurrentAIChatThread(thread.id);

    if (!isSameThread) {
      const newDraft =
        store.get(agentChatDraftsByThreadIdState.atom)[thread.id] ?? '';
      setAgentChatInput(newDraft);
    }

    const clickedFamilyKey = { threadId: thread.id };

    store.set(
      threadTitleFamilyCallback(clickedFamilyKey),
      thread.title ?? null,
    );

    const hasUsageData =
      (thread.conversationSize ?? 0) > 0 &&
      isDefined(thread.contextWindowTokens);
    store.set(
      agentChatUsageFamilyCallback(clickedFamilyKey),
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
