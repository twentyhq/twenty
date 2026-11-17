import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useAiChatSubscription } from '@/ai/hooks/useAiChatSubscription';
import { aiChatFetchedMessagesFamilyState } from '@/ai/states/aiChatFetchedMessagesFamilyState';
import { aiChatIsAwaitingFirstChunkFamilyState } from '@/ai/states/aiChatIsAwaitingFirstChunkFamilyState';
import { aiChatIsAwaitingPersistedRefetchFamilyState } from '@/ai/states/aiChatIsAwaitingPersistedRefetchFamilyState';
import { aiChatIsStreamingFamilyState } from '@/ai/states/aiChatIsStreamingFamilyState';
import { aiChatMessagesFamilyState } from '@/ai/states/aiChatMessagesFamilyState';
import { aiChatUsageFamilyState } from '@/ai/states/aiChatUsageFamilyState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { aiChatThreadRecordFamilySelector } from '@/ai/states/selectors/aiChatThreadRecordFamilySelector';
import { getAiChatUsageFromThread } from '@/ai/utils/getAiChatUsageFromThread';
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

  useEffect(() => {
    const thread = store.get(
      aiChatThreadRecordFamilySelector.selectorFamily(threadId),
    );

    if (isDefined(thread)) {
      store.set(
        aiChatUsageFamilyState.atomFamily({ threadId }),
        getAiChatUsageFromThread(thread),
      );
    }
  }, [store, threadId]);

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
