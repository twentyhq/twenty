import { useRefreshAgentChatThreadPermissions } from '@/ai/hooks/useRefreshAgentChatThreadPermissions';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';
import { agentChatFetchedMessagesFamilyState } from '@/ai/states/agentChatFetchedMessagesFamilyState';
import { agentChatQueuedMessagesFamilyState } from '@/ai/states/agentChatQueuedMessagesFamilyState';
import { useRefreshAgentChatThreads } from '@/ai/hooks/useRefreshAgentChatThreads';
import { isChatAccessDenied } from '@/ai/utils/isChatAccessDenied';
import { useEffect } from 'react';
import { t } from '@lingui/core/macro';

import { readUIMessageStream, type UIMessageChunk } from 'ai';
import { print, type ExecutionResult } from 'graphql';
import { useStore } from 'jotai';
import {
  type AgentChatSubscriptionEvent,
  type ExtendedUIMessage,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/AgentChatRefetchMessagesEventName';
import { useApplyAgentChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { agentChatErrorFamilyState } from '@/ai/states/agentChatErrorFamilyState';
import { agentChatFirstLiveSeqFamilyState } from '@/ai/states/agentChatFirstLiveSeqFamilyState';
import { agentChatHandleEventCallbackFamilyState } from '@/ai/states/agentChatHandleEventCallbackFamilyState';
import { agentChatIsAwaitingFirstChunkFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkFamilyState';
import { agentChatIsAwaitingPersistedRefetchFamilyState } from '@/ai/states/agentChatIsAwaitingPersistedRefetchFamilyState';
import { agentChatIsStreamingFamilyState } from '@/ai/states/agentChatIsStreamingFamilyState';
import { agentChatMessagesFamilyState } from '@/ai/states/agentChatMessagesFamilyState';
import { agentChatStreamLastEventTimestampState } from '@/ai/states/agentChatStreamLastEventTimestampState';
import { agentChatStreamResubscribeNonceState } from '@/ai/states/agentChatStreamResubscribeNonceState';
import { agentChatUsageFamilyState } from '@/ai/states/agentChatUsageFamilyState';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { AiChatErrorCode } from '@/ai/utils/aiChatErrorCode';
import { createAiChatCodedError } from '@/ai/utils/createAiChatCodedError';
import { createStreamChunkSequencer } from '@/ai/utils/createStreamChunkSequencer';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { sseClientState } from '@/sse-db-event/states/sseClientState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { markWorkspaceCreditsExhausted } from '@/workspace/utils/updateWorkspaceResourceCreditCap';
import {
  OnAgentChatEventDocument,
  type OnAgentChatEventSubscription,
} from '~/generated-metadata/graphql';

const THROTTLE_MS = 100;
const PERMISSIONS_REFRESH_INTERVAL_MS = 30_000;

// readUIMessageStream needs start chunks that a mid-stream reconnect missed, so inject synthetic ones.
const createMidStreamAdapter = () => {
  let hasSeenStart = false;
  const knownTextPartIds = new Set<string>();
  const knownReasoningPartIds = new Set<string>();
  const knownToolCallIds = new Set<string>();

  return new TransformStream<UIMessageChunk, UIMessageChunk>({
    transform(chunk, controller) {
      if (!hasSeenStart) {
        hasSeenStart = true;
        if (chunk.type !== 'start') {
          controller.enqueue({ type: 'start', messageId: v4() });
          controller.enqueue({ type: 'start-step' });
        }
      }

      if (chunk.type === 'text-start') {
        knownTextPartIds.add(chunk.id);
      } else if (
        (chunk.type === 'text-delta' || chunk.type === 'text-end') &&
        !knownTextPartIds.has(chunk.id)
      ) {
        controller.enqueue({ type: 'text-start', id: chunk.id });
        knownTextPartIds.add(chunk.id);
      }

      if (chunk.type === 'reasoning-start') {
        knownReasoningPartIds.add(chunk.id);
      } else if (
        (chunk.type === 'reasoning-delta' || chunk.type === 'reasoning-end') &&
        !knownReasoningPartIds.has(chunk.id)
      ) {
        controller.enqueue({ type: 'reasoning-start', id: chunk.id });
        knownReasoningPartIds.add(chunk.id);
      }

      if (chunk.type === 'tool-input-start') {
        knownToolCallIds.add(chunk.toolCallId);
      } else if (
        chunk.type === 'tool-input-delta' &&
        !knownToolCallIds.has(chunk.toolCallId)
      ) {
        controller.enqueue({
          type: 'tool-input-start',
          toolCallId: chunk.toolCallId,
          toolName: 'unknown',
        });
        knownToolCallIds.add(chunk.toolCallId);
      }

      controller.enqueue(chunk);
    },
  });
};

type ThreadTitleDataPart = Extract<
  ExtendedUIMessagePart,
  { type: 'data-thread-title' }
>;

const isThreadTitleDataPart = (
  part: ExtendedUIMessagePart,
): part is ThreadTitleDataPart => part.type === 'data-thread-title';

export const useAgentChatSubscription = (threadId: string | null) => {
  const store = useStore();
  // Only a resubscribe trigger: an access denial ends the subscription until the member's permissions change
  const currentUserWorkspace = useAtomStateValue(currentUserWorkspaceState);
  const { refreshAgentChatThreadPermissions } =
    useRefreshAgentChatThreadPermissions();
  const { refreshAgentChatThreads } = useRefreshAgentChatThreads();
  const { applyAgentChatThreadUpdate } = useApplyAgentChatThreadUpdate();
  const sseClient = useAtomStateValue(sseClientState);
  const agentChatStreamResubscribeNonce = useAtomStateValue(
    agentChatStreamResubscribeNonceState,
  );

  useEffect(() => {
    if (!isDefined(threadId) || !isDefined(sseClient)) {
      return;
    }

    const familyKey = { threadId };

    const errorAtom = agentChatErrorFamilyState.atomFamily(familyKey);
    const isStreamingAtom =
      agentChatIsStreamingFamilyState.atomFamily(familyKey);
    const isAwaitingFirstChunkAtom =
      agentChatIsAwaitingFirstChunkFamilyState.atomFamily(familyKey);
    const firstLiveSeqAtom =
      agentChatFirstLiveSeqFamilyState.atomFamily(familyKey);
    const isAwaitingPersistedRefetchAtom =
      agentChatIsAwaitingPersistedRefetchFamilyState.atomFamily(familyKey);
    const handleEventCallbackAtom =
      agentChatHandleEventCallbackFamilyState.atomFamily(familyKey);
    const messagesAtom = agentChatMessagesFamilyState.atomFamily(familyKey);
    const fetchedMessagesAtom =
      agentChatFetchedMessagesFamilyState.atomFamily(familyKey);
    const queuedMessagesAtom =
      agentChatQueuedMessagesFamilyState.atomFamily(familyKey);
    const usageAtom = agentChatUsageFamilyState.atomFamily(familyKey);

    let bridge: TransformStream<UIMessageChunk> | null = null;
    let throttleTimer: ReturnType<typeof setTimeout> | null = null;
    let latestMessage: ExtendedUIMessage | null = null;
    let writer: WritableStreamDefaultWriter<UIMessageChunk> | null = null;
    let disposed = false;
    let accessDenied = false;
    let lastPermissionsRefreshAt: number | undefined;

    store.set(firstLiveSeqAtom, null);
    store.set(agentChatStreamLastEventTimestampState.atom, Date.now());

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

      const currentMessages = store.get(messagesAtom);

      const streamingMsgIndex = currentMessages.findIndex(
        (message) => message.id === messageToFlush.id,
      );

      if (streamingMsgIndex >= 0) {
        const updatedMessages = [...currentMessages];

        updatedMessages[streamingMsgIndex] = messageToFlush;
        store.set(messagesAtom, updatedMessages);
      } else {
        store.set(messagesAtom, [...currentMessages, messageToFlush]);
      }
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

        const title = extendedMessage.parts.find(isThreadTitleDataPart)?.data
          .title;

        const threadRecord = store.get(
          agentChatThreadRecordFamilySelector.selectorFamily(threadId),
        );

        if (
          isDefined(title) &&
          isDefined(threadRecord) &&
          !isNonEmptyString(threadRecord.title)
        ) {
          applyAgentChatThreadUpdate({ id: threadId, title });
        }

        const usage = extendedMessage.metadata?.usage;
        const model = extendedMessage.metadata?.model;

        if (
          isDefined(usage) &&
          isDefined(model) &&
          lastUsageCountedMessageId !== extendedMessage.id
        ) {
          lastUsageCountedMessageId = extendedMessage.id;

          store.set(usageAtom, (prev) => ({
            lastMessage: {
              inputTokens: usage.inputTokens,
              outputTokens: usage.outputTokens,
              cachedInputTokens: usage.cachedInputTokens,
              inputCredits: usage.inputCredits,
              outputCredits: usage.outputCredits,
            },
            cachedInputTokens:
              (prev?.cachedInputTokens ?? 0) + usage.cachedInputTokens,
            conversationSize: usage.conversationSize,
            contextWindowTokens: model.contextWindowTokens,
            inputTokens: (prev?.inputTokens ?? 0) + usage.inputTokens,
            outputTokens: (prev?.outputTokens ?? 0) + usage.outputTokens,
            inputCredits: (prev?.inputCredits ?? 0) + usage.inputCredits,
            outputCredits: (prev?.outputCredits ?? 0) + usage.outputCredits,
          }));
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
      onGapStalled: () =>
        dispatchBrowserEvent(AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME),
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
          if (isDefined(event.seq) && store.get(firstLiveSeqAtom) === null) {
            store.set(firstLiveSeqAtom, event.seq);
          }

          if (store.get(isAwaitingFirstChunkAtom)) {
            store.set(isAwaitingFirstChunkAtom, false);
          }

          chunkSequencer.push(event.chunk as UIMessageChunk, event.seq);
          break;
        }

        case 'message-persisted': {
          resetStreamProcessing();
          store.set(isAwaitingPersistedRefetchAtom, true);
          dispatchBrowserEvent(AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME);
          break;
        }

        case 'tool-call-resolved': {
          dispatchBrowserEvent(AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME);
          break;
        }

        case 'queue-updated': {
          dispatchBrowserEvent(AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME);
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
            void refreshAgentChatThreadPermissions([threadId]);
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
          dispatchBrowserEvent(AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME);
          store.set(isStreamingAtom, false);
          break;
        }
      }
    };

    store.set(handleEventCallbackAtom, () => handleEvent);

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
      void refreshAgentChatThreads();
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
          store.set(agentChatStreamLastEventTimestampState.atom, Date.now());

          const event: AgentChatSubscriptionEvent | undefined =
            value.data?.onAgentChatEvent?.event;

          if (isDefined(event)) {
            if (isGraphqlErrorOfType(store.get(errorAtom), 'NOT_FOUND')) {
              store.set(errorAtom, null);
              dispatchBrowserEvent(AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME);
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

    return () => {
      disposed = true;
      chunkSequencer.reset();
      store.set(isAwaitingFirstChunkAtom, false);
      store.set(handleEventCallbackAtom, null);
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
    agentChatStreamResubscribeNonce,
    store,
    refreshAgentChatThreads,
    refreshAgentChatThreadPermissions,
    applyAgentChatThreadUpdate,
    currentUserWorkspace,
  ]);
};
