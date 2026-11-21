import { t } from '@lingui/core/macro';
import { readUIMessageStream, type UIMessageChunk } from 'ai';
import { print, type ExecutionResult } from 'graphql';
import { type Client } from 'graphql-sse';
import { type createStore } from 'jotai';
import {
  type AgentChatSubscriptionEvent,
  type ExtendedUIMessage,
  mapAgentMessagesToUIMessages,
} from 'twenty-shared/ai';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

import { AI_CHAT_STREAM_LIVENESS_CHECK_INTERVAL_IN_MS } from '@/ai-chat/constants/AiChatStreamLivenessCheckIntervalInMs';
import { AI_CHAT_STREAM_LIVENESS_TIMEOUT_IN_MS } from '@/ai-chat/constants/AiChatStreamLivenessTimeoutInMs';
import { aiChatThreadDisplayedMessagesFamilyState } from '@/ai-chat/states/display/aiChatThreadDisplayedMessagesFamilyState';
import { aiChatThreadReplyErrorFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyErrorFamilyState';
import { aiChatThreadReplyRecoveryAttemptsFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyRecoveryAttemptsFamilyState';
import { aiChatThreadReplyStatusFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyStatusFamilyState';
import { aiChatMessageReactionRevisionsFamilyState } from '@/ai-chat/states/server/aiChatMessageReactionRevisionsFamilyState';
import { aiChatMessageReactionsFamilyState } from '@/ai-chat/states/server/aiChatMessageReactionsFamilyState';
import { aiChatThreadFetchedMessagesFamilyState } from '@/ai-chat/states/server/aiChatThreadFetchedMessagesFamilyState';
import { aiChatThreadIsFetchingMessagesFamilyState } from '@/ai-chat/states/server/aiChatThreadIsFetchingMessagesFamilyState';
import { aiChatThreadIsMissingFamilyState } from '@/ai-chat/states/server/aiChatThreadIsMissingFamilyState';
import { aiChatThreadUsageFamilyState } from '@/ai-chat/states/server/aiChatThreadUsageFamilyState';
import { type AiChatThreadStreamDependencies } from '@/ai-chat/instance/types/AiChatThreadStreamDependencies';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { getAiChatMessageThreadTitle } from '@/ai-chat/threads/utils/getAiChatMessageThreadTitle';
import { refetchToolIndexOnUnknownTools } from '@/ai-chat/tool-calls/utils/refetchToolIndexOnUnknownTools';
import { type AiChatStreamCatchup } from '@/ai-chat/types/AiChatStreamCatchup';
import { type AiChatThreadStream } from '@/ai-chat/types/AiChatThreadStream';
import { accumulateAiChatUsage } from '@/ai-chat/usage/utils/accumulateAiChatUsage';
import { getAiChatUsageFromThread } from '@/ai-chat/usage/utils/getAiChatUsageFromThread';
import { AiChatErrorCode } from '@/ai-chat/utils/aiChatErrorCode';
import { createAiChatCodedError } from '@/ai-chat/utils/createAiChatCodedError';
import { createMidStreamAdapter } from '@/ai-chat/utils/createMidStreamAdapter';
import { createStreamChunkSequencer } from '@/ai-chat/utils/createStreamChunkSequencer';
import { endAiChatReplyStatus } from '@/ai-chat/utils/endAiChatReplyStatus';
import { isChatAccessDenied } from '@/ai-chat/utils/isChatAccessDenied';
import { upsertAiChatMessage } from '@/ai-chat/utils/upsertAiChatMessage';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { markWorkspaceCreditsExhausted } from '@/workspace/utils/updateWorkspaceResourceCreditCap';
import {
  GetChatMessagesDocument,
  OnAgentChatEventDocument,
  type OnAgentChatEventSubscription,
} from '~/generated-metadata/graphql';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

const THROTTLE_MS = 100;
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
  const usageAtom = aiChatThreadUsageFamilyState.atomFamily(familyKey);
  const recoveryAttemptsAtom =
    aiChatThreadReplyRecoveryAttemptsFamilyState.atomFamily(familyKey);
  const liveReactionRevisionsAtom =
    aiChatMessageReactionRevisionsFamilyState.atomFamily(familyKey);

  // Changes made while unsubscribed were missed, so fetches must fill them in again
  store.set(liveReactionRevisionsAtom, {});

  let throttleTimer: ReturnType<typeof setTimeout> | null = null;
  let latestMessage: ExtendedUIMessage | null = null;
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

  const flushLatestMessage = () => {
    const messageToFlush = latestMessage;

    if (isInactive() || !isDefined(messageToFlush)) {
      return;
    }

    store.set(displayedMessagesAtom, (currentMessages) =>
      upsertAiChatMessage(currentMessages, messageToFlush),
    );
    refetchToolIndexOnUnknownTools({
      apolloClient: getDependencies().apolloClient,
      messages: [messageToFlush],
    });
  };

  const scheduleFlush = (message: ExtendedUIMessage) => {
    latestMessage = message;

    if (!isDefined(throttleTimer)) {
      flushLatestMessage();

      throttleTimer = setTimeout(() => {
        throttleTimer = null;
        flushLatestMessage();
      }, THROTTLE_MS);
    }
  };

  const startReadLoop = async (readable: ReadableStream<UIMessageChunk>) => {
    const messageStream = readUIMessageStream({ stream: readable });

    let lastUsageCountedMessageId: string | null = null;

    for await (const message of messageStream) {
      if (isInactive()) {
        break;
      }
      const extendedMessage = message as ExtendedUIMessage;
      const title = getAiChatMessageThreadTitle(extendedMessage);
      const threadRecord = store.get(
        aiChatThreadRecordFamilySelector.selectorFamily(threadId),
      );

      if (
        isDefined(title) &&
        isDefined(threadRecord) &&
        !isNonEmptyString(threadRecord.title)
      ) {
        getDependencies().applyAiChatThreadUpdate({ id: threadId, title });
      }

      const usage = extendedMessage.metadata?.usage;
      const model = extendedMessage.metadata?.model;

      if (
        isDefined(usage) &&
        isDefined(model) &&
        lastUsageCountedMessageId !== extendedMessage.id
      ) {
        lastUsageCountedMessageId = extendedMessage.id;

        store.set(usageAtom, (previousUsage) =>
          accumulateAiChatUsage(
            previousUsage ??
              (isDefined(threadRecord)
                ? getAiChatUsageFromThread(threadRecord)
                : null),
            usage,
            model,
          ),
        );
      }

      scheduleFlush(extendedMessage);
    }

    if (isDefined(throttleTimer)) {
      clearTimeout(throttleTimer);
      throttleTimer = null;
    }
    flushLatestMessage();

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

    // Marked before the query starts, so the fetched messages never replace the stream in between
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

      // A live snapshot is at least as recent as a fetch, which may have been read before it
      const liveReactionRevisions = store.get(liveReactionRevisionsAtom);

      for (const message of data.chatMessages ?? []) {
        if (!isDefined(liveReactionRevisions[message.id])) {
          store.set(
            aiChatMessageReactionsFamilyState.atomFamily({
              messageId: message.id,
            }),
            message.reactions,
          );
        }
      }

      const uiMessages = mapAgentMessagesToUIMessages(data.chatMessages ?? []);

      refetchToolIndexOnUnknownTools({
        apolloClient: getDependencies().apolloClient,
        messages: uiMessages,
      });

      store.set(fetchedMessagesAtom, {
        messages: uiMessages.filter((message) => message.status !== 'queued'),
        queuedMessages: uiMessages.filter(
          (message) => message.status === 'queued',
        ),
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
        const liveRevisions = store.get(liveReactionRevisionsAtom);
        const appliedRevision = liveRevisions[event.messageId];

        if (isDefined(appliedRevision) && event.revision < appliedRevision) {
          break;
        }

        store.set(liveReactionRevisionsAtom, {
          ...liveRevisions,
          [event.messageId]: event.revision,
        });
        store.set(
          aiChatMessageReactionsFamilyState.atomFamily({
            messageId: event.messageId,
          }),
          event.reactions,
        );
        break;
      }

      case 'keepalive': {
        // The reconnect heartbeat also reloads shared link access, catching edit downgrades without polling.
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
    latestMessage = null;
    if (isDefined(throttleTimer)) {
      clearTimeout(throttleTimer);
      throttleTimer = null;
    }
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
        if (isChatAccessDenied(value.errors)) {
          handleAccessDenied();
          return;
        }
        // The server yields the first keepalive itself on subscribe, so only later events prove pub/sub delivers
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
        if (Array.isArray(errors) && isChatAccessDenied(errors)) {
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

    // Resubscribing clears the pending flags, so a started recovery runs until a broadcast arrives or it gives up
    if (
      isAccessDenied ||
      (!isPending && recoveryAttempts === 0) ||
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

  let isDisplayedSyncScheduled = false;

  // Deferred: a chunk sets the status to idle for an instant before streaming
  const syncDisplayedMessages = () => {
    if (isDisplayedSyncScheduled) {
      return;
    }

    isDisplayedSyncScheduled = true;

    queueMicrotask(() => {
      isDisplayedSyncScheduled = false;

      if (
        store.get(replyStatusAtom) !== 'idle' ||
        store.get(isFetchingAtom) ||
        isInactive()
      ) {
        return;
      }

      const fetchedMessages = store.get(fetchedMessagesAtom).messages;

      if (store.get(displayedMessagesAtom) !== fetchedMessages) {
        store.set(displayedMessagesAtom, fetchedMessages);
      }
    });
  };

  const unsubscribeDisplayedSync = [
    store.sub(replyStatusAtom, syncDisplayedMessages),
    store.sub(isFetchingAtom, syncDisplayedMessages),
    store.sub(fetchedMessagesAtom, syncDisplayedMessages),
  ];

  const loadThreadIfUnknown = async () => {
    const storedThread = store.get(
      aiChatThreadRecordFamilySelector.selectorFamily(threadId),
    );

    // A live update or a favorite can store a thread before it is fetched
    if (isDefined(storedThread?.conversationType)) {
      return;
    }

    const loadedThread = await getDependencies().loadAiChatThread(threadId);

    if (!isDisposed && loadedThread === null) {
      store.set(aiChatThreadIsMissingFamilyState.atomFamily(familyKey), true);
    }
  };

  void loadThreadIfUnknown();
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
      unsubscribeDisplayedSync.forEach((unsubscribe) => unsubscribe());
      chunkSequencer.reset();
      store.set(replyStatusAtom, endAiChatReplyStatus('awaiting-first-chunk'));
      if (isDefined(throttleTimer)) {
        clearTimeout(throttleTimer);
      }
      cleanupStream();
      if (!isAccessDenied) {
        disposeSubscription?.();
      }
    },
  };
};
