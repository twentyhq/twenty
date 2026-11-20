import { dispatchAiChatRefetchMessagesEvent } from '@/ai-chat/utils/dispatchAiChatRefetchMessagesEvent';
import { useRefreshAiChatThreadPermissions } from '@/ai-chat/threads/hooks/useRefreshAiChatThreadPermissions';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';
import { aiChatMessageReactionsFamilyState } from '@/ai-chat/messages/states/aiChatMessageReactionsFamilyState';
import { aiChatLiveReactionRevisionsFamilyState } from '@/ai-chat/messages/states/aiChatLiveReactionRevisionsFamilyState';
import { aiChatFetchedMessagesFamilyState } from '@/ai-chat/states/aiChatFetchedMessagesFamilyState';
import { aiChatQueuedMessagesFamilyState } from '@/ai-chat/composer/states/aiChatQueuedMessagesFamilyState';
import { useRefreshAiChatUsage } from '@/ai-chat/usage/hooks/useRefreshAiChatUsage';
import { isChatAccessDenied } from '@/ai-chat/utils/isChatAccessDenied';
import { useCallback, useEffect, useState } from 'react';
import { t } from '@lingui/core/macro';

import { readUIMessageStream, type UIMessageChunk } from 'ai';
import { print, type ExecutionResult } from 'graphql';
import { useStore } from 'jotai';
import {
  type AgentChatSubscriptionEvent,
  type ExtendedUIMessage,
} from 'twenty-shared/ai';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

import { AI_CHAT_STREAM_LIVENESS_CHECK_INTERVAL_IN_MS } from '@/ai-chat/constants/AiChatStreamLivenessCheckIntervalInMs';
import { AI_CHAT_STREAM_LIVENESS_TIMEOUT_IN_MS } from '@/ai-chat/constants/AiChatStreamLivenessTimeoutInMs';
import { useApplyAiChatThreadUpdate } from '@/ai-chat/threads/hooks/useApplyAiChatThreadUpdate';
import { aiChatErrorFamilyState } from '@/ai-chat/states/aiChatErrorFamilyState';
import { aiChatIsAwaitingFirstChunkFamilyState } from '@/ai-chat/states/aiChatIsAwaitingFirstChunkFamilyState';
import { aiChatIsAwaitingPersistedRefetchFamilyState } from '@/ai-chat/states/aiChatIsAwaitingPersistedRefetchFamilyState';
import { aiChatIsStreamingFamilyState } from '@/ai-chat/states/aiChatIsStreamingFamilyState';
import { aiChatMessagesFamilyState } from '@/ai-chat/states/aiChatMessagesFamilyState';
import { aiChatStreamRecoveryAttemptsFamilyState } from '@/ai-chat/states/aiChatStreamRecoveryAttemptsFamilyState';
import { aiChatUsageFamilyState } from '@/ai-chat/usage/states/aiChatUsageFamilyState';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { accumulateAiChatUsage } from '@/ai-chat/usage/utils/accumulateAiChatUsage';
import { AiChatErrorCode } from '@/ai-chat/utils/aiChatErrorCode';
import { createAiChatCodedError } from '@/ai-chat/utils/createAiChatCodedError';
import { createMidStreamAdapter } from '@/ai-chat/utils/createMidStreamAdapter';
import { createStreamChunkSequencer } from '@/ai-chat/utils/createStreamChunkSequencer';
import { getAiChatMessageThreadTitle } from '@/ai-chat/threads/utils/getAiChatMessageThreadTitle';
import { upsertAiChatMessage } from '@/ai-chat/utils/upsertAiChatMessage';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { sseClientState } from '@/sse-db-event/states/sseClientState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { markWorkspaceCreditsExhausted } from '@/workspace/utils/updateWorkspaceResourceCreditCap';
import {
  type GetChatMessagesQuery,
  OnAgentChatEventDocument,
  type OnAgentChatEventSubscription,
} from '~/generated-metadata/graphql';

const THROTTLE_MS = 100;
const PERMISSIONS_REFRESH_INTERVAL_MS = 30_000;
const MAX_SILENT_RECOVERY_ATTEMPTS = 3;

type AiChatStreamCatchup = NonNullable<
  GetChatMessagesQuery['chatStreamCatchupChunks']
>;

type AiChatLiveStream = {
  handleEvent: (event: AgentChatSubscriptionEvent) => void;
  hasAppliedLiveChunk: () => boolean;
};

export const useAiChatSubscription = (threadId: string | null) => {
  const store = useStore();
  // Only a resubscribe trigger: an access denial ends the subscription until the member's permissions change
  const currentUserWorkspace = useAtomStateValue(currentUserWorkspaceState);
  const { refreshAiChatThreadPermissions } =
    useRefreshAiChatThreadPermissions();
  const { refreshAiChatUsage } = useRefreshAiChatUsage();
  const { applyAiChatThreadUpdate } = useApplyAiChatThreadUpdate();
  const sseClient = useAtomStateValue(sseClientState);
  const [resubscribeNonce, setResubscribeNonce] = useState(0);
  const [liveStreamSlot] = useState<{ current: AiChatLiveStream | null }>(
    () => ({ current: null }),
  );

  useEffect(() => {
    if (!isDefined(threadId) || !isDefined(sseClient)) {
      return;
    }

    const familyKey = { threadId };

    const errorAtom = aiChatErrorFamilyState.atomFamily(familyKey);
    const isStreamingAtom = aiChatIsStreamingFamilyState.atomFamily(familyKey);
    const isAwaitingFirstChunkAtom =
      aiChatIsAwaitingFirstChunkFamilyState.atomFamily(familyKey);
    const isAwaitingPersistedRefetchAtom =
      aiChatIsAwaitingPersistedRefetchFamilyState.atomFamily(familyKey);
    const messagesAtom = aiChatMessagesFamilyState.atomFamily(familyKey);
    const fetchedMessagesAtom =
      aiChatFetchedMessagesFamilyState.atomFamily(familyKey);
    const queuedMessagesAtom =
      aiChatQueuedMessagesFamilyState.atomFamily(familyKey);
    const usageAtom = aiChatUsageFamilyState.atomFamily(familyKey);
    const recoveryAttemptsAtom =
      aiChatStreamRecoveryAttemptsFamilyState.atomFamily(familyKey);
    const liveReactionRevisionsAtom =
      aiChatLiveReactionRevisionsFamilyState.atomFamily(familyKey);

    // Changes made while unsubscribed were missed, so fetches must fill them in again
    store.set(liveReactionRevisionsAtom, {});

    let bridge: TransformStream<UIMessageChunk> | null = null;
    let throttleTimer: ReturnType<typeof setTimeout> | null = null;
    let latestMessage: ExtendedUIMessage | null = null;
    let writer: WritableStreamDefaultWriter<UIMessageChunk> | null = null;
    let disposed = false;
    let accessDenied = false;
    let lastPermissionsRefreshAt: number | undefined;
    let lastBroadcastAt = Date.now();
    let hasReceivedInitialKeepalive = false;
    let firstLiveSeq: number | null = null;

    const closeWriter = () => {
      if (isDefined(writer)) {
        writer.close().catch(() => {});
        writer = null;
      }
    };

    const cleanupStream = () => {
      closeWriter();

      if (store.get(isStreamingAtom)) {
        store.set(isStreamingAtom, false);
      }
    };

    const flushToAtom = () => {
      const messageToFlush = latestMessage;

      if (disposed || accessDenied || !isDefined(messageToFlush)) {
        return;
      }

      store.set(messagesAtom, (currentMessages) =>
        upsertAiChatMessage(currentMessages, messageToFlush),
      );
    };

    const scheduleAtomUpdate = (message: ExtendedUIMessage) => {
      latestMessage = message;

      if (!isDefined(throttleTimer)) {
        flushToAtom();

        throttleTimer = setTimeout(() => {
          throttleTimer = null;
          flushToAtom();
        }, THROTTLE_MS);
      }
    };

    const startReadLoop = async (readable: ReadableStream<UIMessageChunk>) => {
      const messageStream = readUIMessageStream({ stream: readable });

      let lastUsageCountedMessageId: string | null = null;

      for await (const message of messageStream) {
        if (disposed || accessDenied) {
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
          applyAiChatThreadUpdate({ id: threadId, title });
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
            accumulateAiChatUsage(previousUsage, usage, model),
          );
        }

        scheduleAtomUpdate(extendedMessage);
      }

      if (isDefined(throttleTimer)) {
        clearTimeout(throttleTimer);
        throttleTimer = null;
      }
      flushToAtom();

      if (!disposed) {
        store.set(isStreamingAtom, false);
      }
    };

    const applyChunk = (chunk: UIMessageChunk) => {
      if (!store.get(isStreamingAtom)) {
        store.set(isStreamingAtom, true);
        store.set(errorAtom, null);

        bridge = new TransformStream<UIMessageChunk>();
        writer = bridge.writable.getWriter();

        const adaptedReadable = bridge.readable.pipeThrough(
          createMidStreamAdapter(),
        );

        startReadLoop(adaptedReadable).catch(() => {
          if (!disposed) {
            store.set(isStreamingAtom, false);
          }
        });
      }

      if (isDefined(writer)) {
        writer.write(chunk).catch(() => {});
      }
    };

    const chunkSequencer = createStreamChunkSequencer({
      onApply: applyChunk,
      onGapStalled: () => dispatchAiChatRefetchMessagesEvent(threadId),
    });

    const resetStreamProcessing = () => {
      chunkSequencer.reset();
      closeWriter();
      store.set(isAwaitingFirstChunkAtom, false);
    };

    const handleEvent = (event: AgentChatSubscriptionEvent) => {
      if (disposed || accessDenied) {
        return;
      }
      switch (event.type) {
        case 'stream-chunk': {
          if (isDefined(event.seq) && firstLiveSeq === null) {
            firstLiveSeq = event.seq;
          }

          if (store.get(isAwaitingFirstChunkAtom)) {
            store.set(isAwaitingFirstChunkAtom, false);
          }

          chunkSequencer.push(event.chunk as UIMessageChunk, event.seq);
          break;
        }

        case 'stream-ended':
        case 'message-persisted': {
          resetStreamProcessing();
          store.set(isAwaitingPersistedRefetchAtom, true);
          dispatchAiChatRefetchMessagesEvent(threadId);
          break;
        }

        case 'message-added':
        case 'tool-call-resolved': {
          dispatchAiChatRefetchMessagesEvent(threadId);
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

        case 'queue-updated': {
          dispatchAiChatRefetchMessagesEvent(threadId);
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
            void refreshAiChatThreadPermissions([threadId]);
          }
          break;
        }

        case 'stream-error': {
          store.set(
            errorAtom,
            createAiChatCodedError(event.message, event.code),
          );

          resetStreamProcessing();
          store.set(isStreamingAtom, false);
          break;
        }

        case 'credits-exhausted': {
          //TODO : add real time on currentUser
          store.set(currentWorkspaceState.atom, markWorkspaceCreditsExhausted);

          store.set(
            errorAtom,
            createAiChatCodedError(
              t`Chat stopped: no more available credits.`,
              AiChatErrorCode.CREDITS_EXHAUSTED,
            ),
          );

          resetStreamProcessing();
          store.set(isAwaitingPersistedRefetchAtom, true);
          dispatchAiChatRefetchMessagesEvent(threadId);
          store.set(isStreamingAtom, false);
          break;
        }

        case 'user-credits-exhausted': {
          if (
            event.workspaceMemberId ===
            store.get(currentWorkspaceMemberState.atom)?.id
          ) {
            refreshAiChatUsage();
          }
          break;
        }
      }
    };

    liveStreamSlot.current = {
      handleEvent,
      hasAppliedLiveChunk: () => firstLiveSeq !== null,
    };

    let disposeSubscription: (() => void) | undefined;

    const handleAccessDenied = () => {
      accessDenied = true;
      disposeSubscription?.();
      latestMessage = null;
      if (isDefined(throttleTimer)) {
        clearTimeout(throttleTimer);
        throttleTimer = null;
      }
      resetStreamProcessing();
      store.set(messagesAtom, []);
      store.set(fetchedMessagesAtom, []);
      store.set(queuedMessagesAtom, []);
      store.set(isStreamingAtom, false);
      store.set(isAwaitingPersistedRefetchAtom, false);
      store.set(
        errorAtom,
        createAiChatCodedError(
          t`This conversation is no longer available.`,
          'NOT_FOUND',
        ),
      );
    };

    const dispose = sseClient.subscribe<OnAgentChatEventSubscription>(
      {
        query: print(OnAgentChatEventDocument),
        variables: { threadId },
      },
      {
        next: (value: ExecutionResult<OnAgentChatEventSubscription>) => {
          if (disposed || accessDenied) {
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

          if (isDefined(event)) {
            const error = store.get(errorAtom);

            if (
              isGraphqlErrorOfType(error, 'NOT_FOUND') ||
              isGraphqlErrorOfType(error, AiChatErrorCode.CONNECTION_LOST)
            ) {
              store.set(errorAtom, null);
              dispatchAiChatRefetchMessagesEvent(threadId);
            }
            handleEvent(event);
          }
        },
        error: (errors) => {
          if (disposed || accessDenied) {
            return;
          }
          if (Array.isArray(errors) && isChatAccessDenied(errors)) {
            handleAccessDenied();
          }
        },
        complete: () => {
          if (!disposed) {
            cleanupStream();
          }
        },
      },
    );

    disposeSubscription = dispose;
    if (accessDenied) {
      dispose();
    }

    const livenessInterval = setInterval(() => {
      const isPending =
        store.get(isStreamingAtom) || store.get(isAwaitingFirstChunkAtom);
      const recoveryAttempts = store.get(recoveryAttemptsAtom);

      // Resubscribing clears the pending flags, so a started recovery runs until a broadcast arrives or it gives up
      if (
        accessDenied ||
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
        store.set(isStreamingAtom, false);
        return;
      }

      store.set(recoveryAttemptsAtom, recoveryAttempts + 1);
      setResubscribeNonce((nonce) => nonce + 1);
      dispatchAiChatRefetchMessagesEvent(threadId);
    }, AI_CHAT_STREAM_LIVENESS_CHECK_INTERVAL_IN_MS);

    return () => {
      disposed = true;
      clearInterval(livenessInterval);
      chunkSequencer.reset();
      store.set(isAwaitingFirstChunkAtom, false);
      liveStreamSlot.current = null;
      if (isDefined(throttleTimer)) {
        clearTimeout(throttleTimer);
      }
      cleanupStream();
      if (!accessDenied) {
        dispose();
      }
    };
  }, [
    threadId,
    sseClient,
    resubscribeNonce,
    store,
    liveStreamSlot,
    refreshAiChatThreadPermissions,
    refreshAiChatUsage,
    applyAiChatThreadUpdate,
    currentUserWorkspace,
  ]);

  const applyStreamCatchup = useCallback(
    (catchup: AiChatStreamCatchup) => {
      const liveStream = liveStreamSlot.current;

      if (!isDefined(liveStream)) {
        return;
      }

      const hasAppliedLiveChunk = liveStream.hasAppliedLiveChunk();

      catchup.chunks.forEach((chunk, index) =>
        liveStream.handleEvent({
          type: 'stream-chunk',
          chunk,
          seq: index + 1,
        }),
      );

      if (isDefined(catchup.error) && !hasAppliedLiveChunk) {
        liveStream.handleEvent({
          type: 'stream-error',
          code: catchup.error.code,
          message: catchup.error.message,
        });
      }
    },
    [liveStreamSlot],
  );

  return { applyStreamCatchup };
};
