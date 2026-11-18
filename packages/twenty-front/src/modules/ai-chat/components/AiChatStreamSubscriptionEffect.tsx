import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useAiChatSubscription } from '@/ai-chat/hooks/useAiChatSubscription';
import { aiChatFetchedMessagesFamilyState } from '@/ai-chat/states/aiChatFetchedMessagesFamilyState';
import { aiChatIsAwaitingFirstChunkFamilyState } from '@/ai-chat/states/aiChatIsAwaitingFirstChunkFamilyState';
import { aiChatIsAwaitingPersistedRefetchFamilyState } from '@/ai-chat/states/aiChatIsAwaitingPersistedRefetchFamilyState';
import { aiChatIsStreamingFamilyState } from '@/ai-chat/states/aiChatIsStreamingFamilyState';
import { aiChatMessagesFamilyState } from '@/ai-chat/states/aiChatMessagesFamilyState';
import { aiChatUsageFamilyState } from '@/ai-chat/usage/states/aiChatUsageFamilyState';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { getAiChatUsageFromThread } from '@/ai-chat/usage/utils/getAiChatUsageFromThread';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

type AiChatStreamSubscriptionEffectProps = {
  threadId: string;
};

export const AiChatStreamSubscriptionEffect = ({
  threadId,
}: AiChatStreamSubscriptionEffectProps) => {
  const store = useStore();
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);

  useAiChatSubscription(threadId === newAiChatThreadId ? null : threadId);

  const aiChatFetchedMessages = useAtomFamilyStateValue(
    aiChatFetchedMessagesFamilyState,
    { threadId },
  );

  const setAiChatMessages = useSetAtomFamilyState(aiChatMessagesFamilyState, {
    threadId,
  });

  const aiChatIsStreaming = useAtomFamilyStateValue(
    aiChatIsStreamingFamilyState,
    { threadId },
  );

  const aiChatIsAwaitingPersistedRefetch = useAtomFamilyStateValue(
    aiChatIsAwaitingPersistedRefetchFamilyState,
    { threadId },
  );

  const aiChatIsAwaitingFirstChunk = useAtomFamilyStateValue(
    aiChatIsAwaitingFirstChunkFamilyState,
    { threadId },
  );

  const aiChatThreadRecord = useAtomFamilySelectorValue(
    aiChatThreadRecordFamilySelector,
    threadId,
  );

  useEffect(() => {
    const usageAtom = aiChatUsageFamilyState.atomFamily({ threadId });

    if (isDefined(aiChatThreadRecord) && !isDefined(store.get(usageAtom))) {
      store.set(usageAtom, getAiChatUsageFromThread(aiChatThreadRecord));
    }
  }, [store, threadId, aiChatThreadRecord]);

  useEffect(() => {
    if (
      aiChatIsStreaming ||
      aiChatIsAwaitingPersistedRefetch ||
      aiChatIsAwaitingFirstChunk
    ) {
      return;
    }

    setAiChatMessages(aiChatFetchedMessages);
  }, [
    aiChatFetchedMessages,
    aiChatIsStreaming,
    aiChatIsAwaitingPersistedRefetch,
    aiChatIsAwaitingFirstChunk,
    setAiChatMessages,
  ]);

  return null;
};
