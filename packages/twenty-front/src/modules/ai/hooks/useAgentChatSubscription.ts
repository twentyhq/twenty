import { useEffect } from 'react';

import { readUIMessageStream, type UIMessageChunk } from 'ai';
import { print, type ExecutionResult } from 'graphql';
import { useStore } from 'jotai';
import {
  type AgentChatSubscriptionEvent,
  type ExtendedUIMessage,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/AgentChatRefetchMessagesEventName';
import { ON_AGENT_CHAT_EVENT } from '@/ai/graphql/subscriptions/OnAgentChatEvent';
import { agentChatErrorComponentFamilyState } from '@/ai/states/agentChatErrorComponentFamilyState';
import { agentChatFirstLiveSeqComponentFamilyState } from '@/ai/states/agentChatFirstLiveSeqComponentFamilyState';
import { agentChatHandleEventCallbackComponentFamilyState } from '@/ai/states/agentChatHandleEventCallbackComponentFamilyState';
import { agentChatIsStreamingComponentFamilyState } from '@/ai/states/agentChatIsStreamingComponentFamilyState';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { agentChatUsageComponentFamilyState } from '@/ai/states/agentChatUsageComponentFamilyState';
import { currentAIChatThreadTitleComponentFamilyState } from '@/ai/states/currentAIChatThreadTitleComponentFamilyState';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { sseClientState } from '@/sse-db-event/states/sseClientState';

const THROTTLE_MS = 100;

// readUIMessageStream requires initialization chunks (start, start-step,
// text-start) before content chunks. When reconnecting to a thread mid-stream,
// those chunks were already sent before we subscribed. This adapter injects
// synthetic initialization chunks so the reader can process mid-stream content.
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

type AgentChatEventPayload = {
  onAgentChatEvent: {
    threadId: string;
    event: AgentChatSubscriptionEvent;
  };
};

export const useAgentChatSubscription = (threadId: string | null) => {
  const store = useStore();
  const sseClient = useAtomStateValue(sseClientState);

  const errorFamilyCallback = useAtomComponentFamilyStateCallbackState(
    agentChatErrorComponentFamilyState,
  );
  const isStreamingFamilyCallback = useAtomComponentFamilyStateCallbackState(
    agentChatIsStreamingComponentFamilyState,
  );
  const firstLiveSeqFamilyCallback = useAtomComponentFamilyStateCallbackState(
    agentChatFirstLiveSeqComponentFamilyState,
  );
  const handleEventCallbackFamilyCallback =
    useAtomComponentFamilyStateCallbackState(
      agentChatHandleEventCallbackComponentFamilyState,
    );
  const messagesFamilyCallback = useAtomComponentFamilyStateCallbackState(
    agentChatMessagesComponentFamilyState,
  );
  const usageFamilyCallback = useAtomComponentFamilyStateCallbackState(
    agentChatUsageComponentFamilyState,
  );
  const threadTitleFamilyCallback = useAtomComponentFamilyStateCallbackState(
    currentAIChatThreadTitleComponentFamilyState,
  );

  useEffect(() => {
    if (!isDefined(threadId) || !isDefined(sseClient)) {
      return;
    }

    const familyKey = { threadId };

    const errorAtom = errorFamilyCallback(familyKey);
    const isStreamingAtom = isStreamingFamilyCallback(familyKey);
    const firstLiveSeqAtom = firstLiveSeqFamilyCallback(familyKey);
    const handleEventCallbackAtom =
      handleEventCallbackFamilyCallback(familyKey);
    const messagesAtom = messagesFamilyCallback(familyKey);
    const usageAtom = usageFamilyCallback(familyKey);
    const threadTitleAtom = threadTitleFamilyCallback(familyKey);

    let bridge: TransformStream<UIMessageChunk> | null = null;
    let throttleTimer: ReturnType<typeof setTimeout> | null = null;
    let latestMessage: ExtendedUIMessage | null = null;
    let writer: WritableStreamDefaultWriter<UIMessageChunk> | null = null;
    let disposed = false;

    store.set(firstLiveSeqAtom, null);

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

      if (!isDefined(messageToFlush)) {
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

      for await (const message of messageStream) {
        const extendedMessage = message as ExtendedUIMessage;

        const titlePart = extendedMessage.parts.find(
          (part) => part.type === 'data-thread-title',
        );

        if (isDefined(titlePart) && titlePart.type === 'data-thread-title') {
          store.set(threadTitleAtom, titlePart.data.title);
        }

        const metadata = extendedMessage.metadata as
          | {
              usage?: {
                inputTokens: number;
                outputTokens: number;
                cachedInputTokens: number;
                inputCredits: number;
                outputCredits: number;
                conversationSize: number;
              };
              model?: {
                contextWindowTokens: number;
              };
            }
          | undefined;

        if (isDefined(metadata?.usage) && isDefined(metadata?.model)) {
          const usage = metadata.usage;
          const model = metadata.model;

          store.set(usageAtom, (prev) => ({
            lastMessage: {
              inputTokens: usage.inputTokens,
              outputTokens: usage.outputTokens,
              cachedInputTokens: usage.cachedInputTokens,
              inputCredits: usage.inputCredits,
              outputCredits: usage.outputCredits,
            },
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

    const handleEvent = (event: AgentChatSubscriptionEvent) => {
      switch (event.type) {
        case 'stream-chunk': {
          if (isDefined(event.seq) && store.get(firstLiveSeqAtom) === null) {
            store.set(firstLiveSeqAtom, event.seq);
          }

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
            writer.write(event.chunk as UIMessageChunk).catch(() => {});
          }
          break;
        }

        case 'message-persisted': {
          closeWriter();
          dispatchBrowserEvent(AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME);
          break;
        }

        case 'queue-updated': {
          dispatchBrowserEvent(AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME);
          break;
        }

        case 'stream-error': {
          const streamError = new Error(event.message) as Error & {
            code?: string;
          };

          streamError.code = event.code;
          store.set(errorAtom, streamError);

          closeWriter();
          store.set(isStreamingAtom, false);
          break;
        }
      }
    };

    store.set(handleEventCallbackAtom, () => handleEvent);

    const dispose = sseClient.subscribe<AgentChatEventPayload>(
      {
        query: print(ON_AGENT_CHAT_EVENT),
        variables: { threadId },
      },
      {
        next: (value: ExecutionResult<AgentChatEventPayload>) => {
          if (isDefined(value.data?.onAgentChatEvent?.event)) {
            handleEvent(
              value.data.onAgentChatEvent.event as AgentChatSubscriptionEvent,
            );
          }
        },
        error: () => {
          // graphql-sse handles reconnection automatically
        },
        complete: () => {
          if (!disposed) {
            cleanupStream();
          }
        },
      },
    );

    return () => {
      disposed = true;
      store.set(handleEventCallbackAtom, null);
      if (isDefined(throttleTimer)) {
        clearTimeout(throttleTimer);
      }
      cleanupStream();
      dispose();
    };
  }, [
    threadId,
    sseClient,
    store,
    errorFamilyCallback,
    isStreamingFamilyCallback,
    firstLiveSeqFamilyCallback,
    handleEventCallbackFamilyCallback,
    messagesFamilyCallback,
    usageFamilyCallback,
    threadTitleFamilyCallback,
  ]);
};
