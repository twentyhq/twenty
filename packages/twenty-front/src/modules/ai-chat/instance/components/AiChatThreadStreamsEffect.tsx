import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useEffect, useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AI_CHAT_THREAD_EVENT_STREAM_REMOVAL_DEBOUNCE_IN_MS } from '@/ai-chat/constants/AiChatThreadEventStreamRemovalDebounceInMs';
import { useIsAiChatRuntimeEnabled } from '@/ai-chat/hooks/useIsAiChatRuntimeEnabled';
import { useLoadAiChatThread } from '@/ai-chat/threads/hooks/useLoadAiChatThread';
import { aiChatRequiredThreadListenersState } from '@/ai-chat/states/aiChatRequiredThreadListenersState';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { type AiChatThreadStreamDependencies } from '@/ai-chat/instance/types/AiChatThreadStreamDependencies';
import { aiChatThreadStreams } from '@/ai-chat/utils/aiChatThreadStreams';
import { openAiChatThreadStream } from '@/ai-chat/instance/utils/openAiChatThreadStream';
import { useApplyAiChatThreadUpdate } from '@/ai-chat/threads/hooks/useApplyAiChatThreadUpdate';
import { useRefreshAiChatThreadPermissions } from '@/ai-chat/threads/hooks/useRefreshAiChatThreadPermissions';
import { useRefreshAiChatUsage } from '@/ai-chat/usage/hooks/useRefreshAiChatUsage';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { sseClientState } from '@/sse-db-event/states/sseClientState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AiChatThreadStreamsEffect = () => {
  const store = useStore();
  const apolloClient = useApolloClient();
  const isAiChatRuntimeEnabled = useIsAiChatRuntimeEnabled();
  const sseClient = useAtomStateValue(sseClientState);
  // Only a resubscribe trigger: an access denial ends the subscription until the member's permissions change
  const currentUserWorkspace = useAtomStateValue(currentUserWorkspaceState);
  const aiChatRequiredThreadListeners = useAtomStateValue(
    aiChatRequiredThreadListenersState,
  );
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);
  const { refreshAiChatThreadPermissions } =
    useRefreshAiChatThreadPermissions();
  const { refreshAiChatUsage } = useRefreshAiChatUsage();
  const { applyAiChatThreadUpdate } = useApplyAiChatThreadUpdate();
  const { loadAiChatThread } = useLoadAiChatThread();

  const currentDependencies: AiChatThreadStreamDependencies = {
    apolloClient,
    applyAiChatThreadUpdate,
    loadAiChatThread,
    refreshAiChatThreadPermissions,
    refreshAiChatUsage,
  };
  const [dependencies] = useState(() => ({ current: currentDependencies }));
  const [removalTimeouts] = useState(
    () => new Map<string, ReturnType<typeof setTimeout>>(),
  );

  dependencies.current = currentDependencies;

  const requiredThreadIds = useMemo(
    () =>
      [...new Set(Object.values(aiChatRequiredThreadListeners))].filter(
        (threadId) => threadId !== newAiChatThreadId,
      ),
    [aiChatRequiredThreadListeners, newAiChatThreadId],
  );

  useEffect(() => {
    if (!isAiChatRuntimeEnabled || !isDefined(sseClient)) {
      return;
    }

    const openStream = (threadId: string) => {
      aiChatThreadStreams.set(
        threadId,
        openAiChatThreadStream({
          threadId,
          store,
          sseClient,
          getDependencies: () => dependencies.current,
          onResubscribeRequested: () => {
            aiChatThreadStreams.get(threadId)?.dispose();
            openStream(threadId);
          },
        }),
      );
    };

    for (const threadId of requiredThreadIds) {
      clearTimeout(removalTimeouts.get(threadId));
      removalTimeouts.delete(threadId);

      if (!aiChatThreadStreams.has(threadId)) {
        openStream(threadId);
      }
    }

    // A chat moving to another view hands its stream over instead of restarting it
    for (const threadId of aiChatThreadStreams.keys()) {
      if (
        requiredThreadIds.includes(threadId) ||
        removalTimeouts.has(threadId)
      ) {
        continue;
      }

      removalTimeouts.set(
        threadId,
        setTimeout(() => {
          removalTimeouts.delete(threadId);
          aiChatThreadStreams.get(threadId)?.dispose();
          aiChatThreadStreams.delete(threadId);
        }, AI_CHAT_THREAD_EVENT_STREAM_REMOVAL_DEBOUNCE_IN_MS),
      );
    }
  }, [
    dependencies,
    isAiChatRuntimeEnabled,
    removalTimeouts,
    requiredThreadIds,
    sseClient,
    store,
    currentUserWorkspace,
  ]);

  useEffect(
    () => () => {
      for (const timeout of removalTimeouts.values()) {
        clearTimeout(timeout);
      }
      removalTimeouts.clear();

      for (const stream of aiChatThreadStreams.values()) {
        stream.dispose();
      }
      aiChatThreadStreams.clear();
    },
    [isAiChatRuntimeEnabled, removalTimeouts, sseClient, currentUserWorkspace],
  );

  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: () => {
      for (const stream of aiChatThreadStreams.values()) {
        stream.resync();
      }
    },
  });

  return null;
};
