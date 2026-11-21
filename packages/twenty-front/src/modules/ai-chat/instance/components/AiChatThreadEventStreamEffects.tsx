import { useEffect, useMemo, useState } from 'react';

import { AiChatThreadEventStreamEffect } from '@/ai-chat/instance/components/AiChatThreadEventStreamEffect';
import { AI_CHAT_THREAD_EVENT_STREAM_REMOVAL_DEBOUNCE_IN_MS } from '@/ai-chat/constants/AiChatThreadEventStreamRemovalDebounceInMs';
import { useIsAiChatRuntimeEnabled } from '@/ai-chat/hooks/useIsAiChatRuntimeEnabled';
import { aiChatRequiredThreadListenersState } from '@/ai-chat/states/aiChatRequiredThreadListenersState';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AiChatThreadEventStreamEffects = () => {
  const isAiChatRuntimeEnabled = useIsAiChatRuntimeEnabled();
  const aiChatRequiredThreadListeners = useAtomStateValue(
    aiChatRequiredThreadListenersState,
  );
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);
  const [streamedThreadIds, setStreamedThreadIds] = useState<string[]>([]);

  const requiredThreadIds = useMemo(
    () =>
      [...new Set(Object.values(aiChatRequiredThreadListeners))].filter(
        (threadId) => threadId !== newAiChatThreadId,
      ),
    [aiChatRequiredThreadListeners, newAiChatThreadId],
  );

  useEffect(() => {
    const addedThreadIds = requiredThreadIds.filter(
      (threadId) => !streamedThreadIds.includes(threadId),
    );

    if (addedThreadIds.length > 0) {
      setStreamedThreadIds([...streamedThreadIds, ...addedThreadIds]);

      return;
    }

    const hasRemovedThreadIds = streamedThreadIds.some(
      (threadId) => !requiredThreadIds.includes(threadId),
    );

    if (!hasRemovedThreadIds) {
      return;
    }

    // A chat moving to another view hands its stream over instead of restarting it
    const timeoutId = setTimeout(
      () =>
        setStreamedThreadIds((currentThreadIds) =>
          currentThreadIds.filter((threadId) =>
            requiredThreadIds.includes(threadId),
          ),
        ),
      AI_CHAT_THREAD_EVENT_STREAM_REMOVAL_DEBOUNCE_IN_MS,
    );

    return () => clearTimeout(timeoutId);
  }, [requiredThreadIds, streamedThreadIds]);

  if (!isAiChatRuntimeEnabled) {
    return null;
  }

  return (
    <>
      {streamedThreadIds.map((threadId) => (
        <AiChatThreadEventStreamEffect key={threadId} threadId={threadId} />
      ))}
    </>
  );
};
