import { dispatchAiChatRefetchMessagesEvent } from '@/ai-chat/utils/dispatchAiChatRefetchMessagesEvent';
import { useRefreshAiChatThreadPermissions } from '@/ai-chat/threads/hooks/useRefreshAiChatThreadPermissions';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';
import { aiChatMessageReactionsFamilyState } from '@/ai-chat/states/server/aiChatMessageReactionsFamilyState';
import { aiChatMessageReactionRevisionsFamilyState } from '@/ai-chat/states/server/aiChatMessageReactionRevisionsFamilyState';
import { aiChatThreadFetchedMessagesFamilyState } from '@/ai-chat/states/server/aiChatThreadFetchedMessagesFamilyState';
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
import { aiChatThreadReplyErrorFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyErrorFamilyState';
import { aiChatThreadIsFetchingMessagesFamilyState } from '@/ai-chat/states/server/aiChatThreadIsFetchingMessagesFamilyState';
import { aiChatThreadReplyStatusFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyStatusFamilyState';
import { endAiChatReplyStatus } from '@/ai-chat/utils/endAiChatReplyStatus';
import { aiChatThreadDisplayedMessagesFamilyState } from '@/ai-chat/states/display/aiChatThreadDisplayedMessagesFamilyState';
import { aiChatThreadReplyRecoveryAttemptsFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyRecoveryAttemptsFamilyState';
import { aiChatThreadUsageFamilyState } from '@/ai-chat/states/server/aiChatThreadUsageFamilyState';
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

    const errorAtom = aiChatThreadReplyErrorFamilyState.atomFamily(familyKey);
    const replyStatusAtom =
      aiChatThreadReplyStatusFamilyState.atomFamily(familyKey);
    const messagesLoadingAtom =
      aiChatThreadIsFetchingMessagesFamilyState.atomFamily(familyKey);
    const messagesAtom =
      aiChatThreadDisplayedMessagesFamilyState.atomFamily(familyKey);
    const persistedMessagesAtom =
      aiChatThreadFetchedMessagesFamilyState.atomFamily(familyKey);
    const usageAtom = aiChatThreadUsageFamilyState.atomFamily(familyKey);
    const recoveryAttemptsAtom =
      aiChatThreadReplyRecoveryAttemptsFamilyState.atomFamily(familyKey);
    const liveReactionRevisionsAtom =
      aiChatMessageReactionRevisionsFamilyState.atomFamily(familyKey);

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
    let isStreamOpen = false;

    const closeWriter = () => {
      if (isDefined(writer)) {
        writer.close().catch(() => {});
        writer = null;
      }
    };

    // Marked before the query starts, so the fetched messages never replace the stream in between
    const requestPersistedRefetch = () => {
      store.set(messagesLoadingAtom, true);
      dispatchAiChatRefetchMessagesEvent(threadId);
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
        endStream();
      }
    };

    const applyChunk = (chunk: UIMessageChunk) => {
      if (!isStreamOpen) {
        isStreamOpen = true;
        store.set(replyStatusAtom, 'streaming');
        store.set(errorAtom, null);

        bridge = new TransformStream<UIMessageChunk>();
        writer = bridge.writable.getWriter();

        const adaptedReadable = bridge.readable.pipeThrough(
          createMidStreamAdapter(),
        );

        startReadLoop(adaptedReadable).catch(() => {
          if (!disposed) {
            endStream();
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
      store.set(replyStatusAtom, endAiChatReplyStatus('awaiting-first-chunk'));
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
          requestPersistedRefetch();
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
          endStream();
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
          requestPersistedRefetch();
          endStream();
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
      store.set(persistedMessagesAtom, { messages: [], queuedMessages: [] });
      isStreamOpen = false;
      store.set(replyStatusAtom, 'idle');
      store.set(messagesLoadingAtom, false);
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
        isStreamOpen || store.get(replyStatusAtom) === 'awaiting-first-chunk';
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
        endStream();
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
      store.set(replyStatusAtom, endAiChatReplyStatus('awaiting-first-chunk'));
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
