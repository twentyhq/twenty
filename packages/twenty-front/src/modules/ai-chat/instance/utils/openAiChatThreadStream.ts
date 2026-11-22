import { t } from '@lingui/core/macro';
import { readUIMessageStream, type UIMessageChunk } from 'ai';
import { print, type ExecutionResult } from 'graphql';
import { type Client } from 'graphql-sse';
import { type createStore } from 'jotai';
import {
  type AgentChatSubscriptionEvent,
  type ExtendedUIMessage,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { AI_CHAT_STREAM_LIVENESS_CHECK_INTERVAL_IN_MS } from '@/ai-chat/instance/constants/AiChatStreamLivenessCheckIntervalInMs';
import { AI_CHAT_STREAM_LIVENESS_TIMEOUT_IN_MS } from '@/ai-chat/instance/constants/AiChatStreamLivenessTimeoutInMs';
import { aiChatThreadDisplayedMessagesFamilyState } from '@/ai-chat/states/display/aiChatThreadDisplayedMessagesFamilyState';
import { aiChatThreadReplyErrorFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyErrorFamilyState';
import { aiChatThreadReplyRecoveryAttemptsFamilyState } from '@/ai-chat/instance/states/aiChatThreadReplyRecoveryAttemptsFamilyState';
import { aiChatThreadReplyStatusFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyStatusFamilyState';
import { aiChatMessageReactionRevisionsFamilyState } from '@/ai-chat/states/server/aiChatMessageReactionRevisionsFamilyState';
import { aiChatThreadFetchedMessagesFamilyState } from '@/ai-chat/states/server/aiChatThreadFetchedMessagesFamilyState';
import { aiChatThreadIsFetchingMessagesFamilyState } from '@/ai-chat/states/server/aiChatThreadIsFetchingMessagesFamilyState';
import { type AiChatThreadStreamDependencies } from '@/ai-chat/instance/types/AiChatThreadStreamDependencies';
import { type AiChatStreamCatchup } from '@/ai-chat/instance/types/AiChatStreamCatchup';
import { type AiChatThreadStream } from '@/ai-chat/types/AiChatThreadStream';
import { AiChatErrorCode } from '@/ai-chat/utils/aiChatErrorCode';
import { createAiChatCodedError } from '@/ai-chat/utils/createAiChatCodedError';
import { applyAiChatMessageReactionsUpdate } from '@/ai-chat/instance/utils/applyAiChatMessageReactionsUpdate';
import { createAiChatStreamedMessageThreadUpdater } from '@/ai-chat/instance/utils/createAiChatStreamedMessageThreadUpdater';
import { createAiChatStreamMessageFlusher } from '@/ai-chat/instance/utils/createAiChatStreamMessageFlusher';
import { createMidStreamAdapter } from '@/ai-chat/instance/utils/createMidStreamAdapter';
import { createStreamChunkSequencer } from '@/ai-chat/instance/utils/createStreamChunkSequencer';
import { endAiChatReplyStatus } from '@/ai-chat/utils/endAiChatReplyStatus';
import { isAiChatAccessDenied } from '@/ai-chat/instance/utils/isAiChatAccessDenied';
import { loadAiChatThreadIfUnknown } from '@/ai-chat/instance/utils/loadAiChatThreadIfUnknown';
import { storeFetchedAiChatMessages } from '@/ai-chat/instance/utils/storeFetchedAiChatMessages';
import { subscribeToAiChatDisplayedMessagesSync } from '@/ai-chat/instance/utils/subscribeToAiChatDisplayedMessagesSync';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { markWorkspaceCreditsExhausted } from '@/workspace/utils/updateWorkspaceResourceCreditCap';
import {
  GetChatMessagesDocument,
  OnAgentChatEventDocument,
  type OnAgentChatEventSubscription,
} from '~/generated-metadata/graphql';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

const PERMISSIONS_REFRESH_INTERVAL_MS = 30_000;
const MAX_SILENT_RECOVERY_ATTEMPTS = 3;

export const openAiChatThreadStream = ({
  threadId,
  store,
  sseClient,
  getDependencies,
  onResubscribeRequested,
}: {
  threadId: string;
  store: ReturnType<typeof createStore>;
  sseClient: Client;
  getDependencies: () => AiChatThreadStreamDependencies;
  onResubscribeRequested: () => void;
}): AiChatThreadStream => {
  const familyKey = { threadId };

  const errorAtom = aiChatThreadReplyErrorFamilyState.atomFamily(familyKey);
  const replyStatusAtom =
    aiChatThreadReplyStatusFamilyState.atomFamily(familyKey);
  const isFetchingAtom =
    aiChatThreadIsFetchingMessagesFamilyState.atomFamily(familyKey);
  const displayedMessagesAtom =
    aiChatThreadDisplayedMessagesFamilyState.atomFamily(familyKey);
  const fetchedMessagesAtom =
    aiChatThreadFetchedMessagesFamilyState.atomFamily(familyKey);
  const recoveryAttemptsAtom =
    aiChatThreadReplyRecoveryAttemptsFamilyState.atomFamily(familyKey);
  const liveReactionRevisionsAtom =
    aiChatMessageReactionRevisionsFamilyState.atomFamily(familyKey);

  store.set(liveReactionRevisionsAtom, {});

  let writer: WritableStreamDefaultWriter<UIMessageChunk> | null = null;
  let isDisposed = false;
  let isAccessDenied = false;
  let lastPermissionsRefreshAt: number | undefined;
  let lastBroadcastAt = Date.now();
  let hasReceivedInitialKeepalive = false;
  let firstLiveSeq: number | null = null;
  let isStreamOpen = false;
  let lastFetchId = 0;

  const isInactive = () => isDisposed || isAccessDenied;

  const messageFlusher = createAiChatStreamMessageFlusher({
    store,
    threadId,
    isInactive,
    getApolloClient: () => getDependencies().apolloClient,
  });

  const closeWriter = () => {
    if (isDefined(writer)) {
      writer.close().catch(() => {});
      writer = null;
    }
  };

  const endStream = () => {
    isStreamOpen = false;
    store.set(replyStatusAtom, endAiChatReplyStatus('streaming'));
  };

  const cleanupStream = () => {
    closeWriter();

    if (isStreamOpen) {
      endStream();
    }
  };

  const startReadLoop = async (readable: ReadableStream<UIMessageChunk>) => {
    const messageStream = readUIMessageStream({ stream: readable });
    const updateThreadFromStreamedMessage =
      createAiChatStreamedMessageThreadUpdater({
        store,
        threadId,
        applyAiChatThreadUpdate: (update) =>
          getDependencies().applyAiChatThreadUpdate(update),
      });

    for await (const message of messageStream) {
      if (isInactive()) {
        break;
      }
      const extendedMessage = message as ExtendedUIMessage;

      updateThreadFromStreamedMessage(extendedMessage);
      messageFlusher.schedule(extendedMessage);
    }

    messageFlusher.flush();

    if (!isDisposed) {
      endStream();
    }
  };

  const applyChunk = (chunk: UIMessageChunk) => {
    if (!isStreamOpen) {
      isStreamOpen = true;
      store.set(replyStatusAtom, 'streaming');
      store.set(errorAtom, null);

      const bridge = new TransformStream<UIMessageChunk>();

      writer = bridge.writable.getWriter();

      startReadLoop(
        bridge.readable.pipeThrough(createMidStreamAdapter()),
      ).catch(() => {
        if (!isDisposed) {
          endStream();
        }
      });
    }

    if (isDefined(writer)) {
      writer.write(chunk).catch(() => {});
    }
  };

  const fetchMessages = async () => {
    if (isInactive()) {
      return;
    }

    const fetchId = ++lastFetchId;

    store.set(isFetchingAtom, true);

    try {
      const { data } = await getDependencies().apolloClient.query({
        query: GetChatMessagesDocument,
        variables: { threadId },
        fetchPolicy: 'network-only',
      });

      if (isInactive() || fetchId !== lastFetchId || !isDefined(data)) {
        return;
      }

      if (isGraphqlErrorOfType(store.get(errorAtom), 'NOT_FOUND')) {
        return;
      }

      storeFetchedAiChatMessages({
        store,
        threadId,
        chatMessages: data.chatMessages ?? [],
        apolloClient: getDependencies().apolloClient,
      });

      if (isDefined(data.chatStreamCatchupChunks)) {
        applyCatchup(data.chatStreamCatchupChunks);
      }
    } catch {
      return;
    } finally {
      if (fetchId === lastFetchId) {
        store.set(isFetchingAtom, false);
      }
    }
  };

  const refetchMessages = () => {
    void fetchMessages();
  };

  const chunkSequencer = createStreamChunkSequencer({
    onApply: applyChunk,
    onGapStalled: refetchMessages,
  });

  const resetStreamProcessing = () => {
    chunkSequencer.reset();
    closeWriter();
    store.set(replyStatusAtom, endAiChatReplyStatus('awaiting-first-chunk'));
  };

  const handleEvent = (event: AgentChatSubscriptionEvent) => {
    if (isInactive()) {
      return;
    }
    switch (event.type) {
      case 'stream-chunk': {
        if (isDefined(event.seq) && !isDefined(firstLiveSeq)) {
          firstLiveSeq = event.seq;
        }

        store.set(
          replyStatusAtom,
          endAiChatReplyStatus('awaiting-first-chunk'),
        );
        chunkSequencer.push(event.chunk as UIMessageChunk, event.seq);
        break;
      }

      case 'stream-ended':
      case 'message-persisted': {
        resetStreamProcessing();
        refetchMessages();
        break;
      }

      case 'message-added':
      case 'tool-call-resolved':
      case 'queue-updated': {
        refetchMessages();
        break;
      }

      case 'message-reactions-updated': {
        applyAiChatMessageReactionsUpdate({ store, threadId, event });
        break;
      }

      case 'keepalive': {
        if (
          !isDefined(lastPermissionsRefreshAt) ||
          Date.now() - lastPermissionsRefreshAt >=
            PERMISSIONS_REFRESH_INTERVAL_MS
        ) {
          lastPermissionsRefreshAt = Date.now();
          void getDependencies().refreshAiChatThreadPermissions([threadId]);
        }
        break;
      }

      case 'stream-error': {
        store.set(errorAtom, createAiChatCodedError(event.message, event.code));
        resetStreamProcessing();
        endStream();
        break;
      }

      case 'credits-exhausted': {
        store.set(currentWorkspaceState.atom, markWorkspaceCreditsExhausted);
        store.set(
          errorAtom,
          createAiChatCodedError(
            t`Chat stopped: no more available credits.`,
            AiChatErrorCode.CREDITS_EXHAUSTED,
          ),
        );
        resetStreamProcessing();
        refetchMessages();
        endStream();
        break;
      }

      case 'user-credits-exhausted': {
        if (
          event.workspaceMemberId ===
          store.get(currentWorkspaceMemberState.atom)?.id
        ) {
          getDependencies().refreshAiChatUsage();
        }
        break;
      }
    }
  };

  function applyCatchup(catchup: AiChatStreamCatchup) {
    const hasAppliedLiveChunk = isDefined(firstLiveSeq);

    catchup.chunks.forEach((chunk, index) =>
      handleEvent({ type: 'stream-chunk', chunk, seq: index + 1 }),
    );

    if (isDefined(catchup.error) && !hasAppliedLiveChunk) {
      handleEvent({
        type: 'stream-error',
        code: catchup.error.code,
        message: catchup.error.message,
      });
    }
  }

  let disposeSubscription: (() => void) | undefined;

  const handleAccessDenied = () => {
    isAccessDenied = true;
    disposeSubscription?.();
    messageFlusher.cancel();
    resetStreamProcessing();
    store.set(displayedMessagesAtom, []);
    store.set(fetchedMessagesAtom, { messages: [], queuedMessages: [] });
    isStreamOpen = false;
    store.set(replyStatusAtom, 'idle');
    store.set(isFetchingAtom, false);
    store.set(
      errorAtom,
      createAiChatCodedError(
        t`This conversation is no longer available.`,
        'NOT_FOUND',
      ),
    );
  };

  disposeSubscription = sseClient.subscribe<OnAgentChatEventSubscription>(
    { query: print(OnAgentChatEventDocument), variables: { threadId } },
    {
      next: (value: ExecutionResult<OnAgentChatEventSubscription>) => {
        if (isInactive()) {
          return;
        }
        if (isAiChatAccessDenied(value.errors)) {
          handleAccessDenied();
          return;
        }
        if (hasReceivedInitialKeepalive) {
          lastBroadcastAt = Date.now();
          store.set(recoveryAttemptsAtom, 0);
        }
        hasReceivedInitialKeepalive = true;

        const event: AgentChatSubscriptionEvent | undefined =
          value.data?.onAgentChatEvent?.event;

        if (!isDefined(event)) {
          return;
        }

        const error = store.get(errorAtom);

        if (
          isGraphqlErrorOfType(error, 'NOT_FOUND') ||
          isGraphqlErrorOfType(error, AiChatErrorCode.CONNECTION_LOST)
        ) {
          store.set(errorAtom, null);
          refetchMessages();
        }
        handleEvent(event);
      },
      error: (errors) => {
        if (isInactive()) {
          return;
        }
        if (Array.isArray(errors) && isAiChatAccessDenied(errors)) {
          handleAccessDenied();
        }
      },
      complete: () => {
        if (!isDisposed) {
          cleanupStream();
        }
      },
    },
  );

  if (isAccessDenied) {
    disposeSubscription();
  }

  const livenessInterval = setInterval(() => {
    const isPending =
      isStreamOpen || store.get(replyStatusAtom) === 'awaiting-first-chunk';
    const recoveryAttempts = store.get(recoveryAttemptsAtom);
    const isRecoveryInProgress = recoveryAttempts !== 0;

    if (
      isAccessDenied ||
      (!isPending && !isRecoveryInProgress) ||
      Date.now() - lastBroadcastAt <= AI_CHAT_STREAM_LIVENESS_TIMEOUT_IN_MS
    ) {
      return;
    }

    if (recoveryAttempts >= MAX_SILENT_RECOVERY_ATTEMPTS) {
      store.set(recoveryAttemptsAtom, 0);
      store.set(
        errorAtom,
        createAiChatCodedError(
          t`Connection to the assistant was lost. Reload to see the response.`,
          AiChatErrorCode.CONNECTION_LOST,
        ),
      );
      resetStreamProcessing();
      endStream();
      return;
    }

    store.set(recoveryAttemptsAtom, recoveryAttempts + 1);
    onResubscribeRequested();
  }, AI_CHAT_STREAM_LIVENESS_CHECK_INTERVAL_IN_MS);

  const unsubscribeDisplayedMessagesSync =
    subscribeToAiChatDisplayedMessagesSync({ store, threadId, isInactive });

  void loadAiChatThreadIfUnknown({
    store,
    threadId,
    loadAiChatThread: (threadIdToLoad) =>
      getDependencies().loadAiChatThread(threadIdToLoad),
    isDisposed: () => isDisposed,
  });
  refetchMessages();

  return {
    refetchMessages,
    resync: () => {
      store.set(liveReactionRevisionsAtom, {});
      refetchMessages();
    },
    dispose: () => {
      isDisposed = true;
      clearInterval(livenessInterval);
      unsubscribeDisplayedMessagesSync();
      chunkSequencer.reset();
      store.set(replyStatusAtom, endAiChatReplyStatus('awaiting-first-chunk'));
      messageFlusher.cancel();
      cleanupStream();
      if (!isAccessDenied) {
        disposeSubscription?.();
      }
    },
  };
};
