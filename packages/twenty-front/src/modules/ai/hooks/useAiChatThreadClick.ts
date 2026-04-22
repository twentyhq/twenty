import { agentChatDraftsByThreadIdState } from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { agentChatUsageComponentFamilyState } from '@/ai/states/agentChatUsageComponentFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { currentAiChatThreadTitleComponentFamilyState } from '@/ai/states/currentAiChatThreadTitleComponentFamilyState';
import { threadIdCreatedFromDraftState } from '@/ai/states/threadIdCreatedFromDraftState';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { type AgentChatThread } from '~/generated-metadata/graphql';

export type UseAiChatThreadClickOptions = {
  resetNavigationStack?: boolean;
};

export const useAiChatThreadClick = (
  options: UseAiChatThreadClickOptions = {},
) => {
  const { resetNavigationStack = false } = options;
  const setThreadIdCreatedFromDraft = useSetAtomState(
    threadIdCreatedFromDraftState,
  );
  const [currentAiChatThread, setCurrentAiChatThread] = useAtomState(
    currentAiChatThreadState,
  );
  const setAgentChatInput = useSetAtomState(agentChatInputState);
  const setAgentChatDraftsByThreadId = useSetAtomState(
    agentChatDraftsByThreadIdState,
  );
  const threadTitleFamilyCallback = useAtomComponentFamilyStateCallbackState(
    currentAiChatThreadTitleComponentFamilyState,
  );
  const agentChatUsageFamilyCallback = useAtomComponentFamilyStateCallbackState(
    agentChatUsageComponentFamilyState,
  );
  const store = useStore();
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();

  const handleThreadClick = (thread: AgentChatThread) => {
    setThreadIdCreatedFromDraft(null);
    const isSameThread = thread.id === currentAiChatThread;

    if (currentAiChatThread !== null) {
      setAgentChatDraftsByThreadId((prev) => ({
        ...prev,
        [currentAiChatThread]: store.get(agentChatInputState.atom),
      }));
    }
    setCurrentAiChatThread(thread.id);

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

    openAskAiPage({
      resetNavigationStack,
    });
  };

  return { handleThreadClick };
};
