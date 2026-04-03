import { useCallback, useEffect } from 'react';

import { readUIMessageStream, type UIMessageChunk } from 'ai';
import { print, type ExecutionResult } from 'graphql';
import { useStore } from 'jotai';
import {
  type AgentChatSubscriptionEvent,
  type ExtendedUIMessage,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { AGENT_CHAT_INSTANCE_ID } from '@/ai/constants/AgentChatInstanceId';
import { AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/AgentChatRefetchMessagesEventName';
import { ON_AGENT_CHAT_EVENT } from '@/ai/graphql/subscriptions/OnAgentChatEvent';
import { agentChatErrorState } from '@/ai/states/agentChatErrorState';
import { agentChatFirstLiveSeqState } from '@/ai/states/agentChatFirstLiveSeqState';
import { agentChatHandleEventCallbackState } from '@/ai/states/agentChatHandleEventCallbackState';
import { agentChatIsStreamingState } from '@/ai/states/agentChatIsStreamingState';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { agentChatStreamWriterState } from '@/ai/states/agentChatStreamWriterState';
import { agentChatSubscriptionDisposeState } from '@/ai/states/agentChatSubscriptionDisposeState';
import { agentChatUsageState } from '@/ai/states/agentChatUsageState';
import { currentAIChatThreadTitleState } from '@/ai/states/currentAIChatThreadTitleState';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
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

  const cleanup = useCallback(() => {
    const writer = store.get(agentChatStreamWriterState.atom);

    if (isDefined(writer)) {
      writer.close().catch(() => {});
      store.set(agentChatStreamWriterState.atom, null);
    }

    const dispose = store.get(agentChatSubscriptionDisposeState.atom);

    if (isDefined(dispose)) {
      dispose();
      store.set(agentChatSubscriptionDisposeState.atom, null);
    }

    if (store.get(agentChatIsStreamingState.atom)) {
      store.set(agentChatIsStreamingState.atom, false);
    }
  }, [store]);

  useEffect(() => {
    if (!isDefined(threadId)) {
      cleanup();

      return;
    }

    if (!isDefined(sseClient)) {
      return;
    }

    let bridge: TransformStream<UIMessageChunk> | null = null;
    let throttleTimer: ReturnType<typeof setTimeout> | null = null;
    let latestMessage: ExtendedUIMessage | null = null;

    store.set(agentChatFirstLiveSeqState.atom, null);

    const flushToAtom = () => {
      const messageToFlush = latestMessage;

      if (!isDefined(messageToFlush) || !isDefined(threadId)) {
        return;
      }

      const atomKey = {
        instanceId: AGENT_CHAT_INSTANCE_ID,
        familyKey: { threadId },
      };

      const currentMessages = store.get(
        agentChatMessagesComponentFamilyState.atomFamily(atomKey),
      );

      const streamingMsgIndex = currentMessages.findIndex(
        (message) => message.id === messageToFlush.id,
      );

      if (streamingMsgIndex >= 0) {
        const updatedMessages = [...currentMessages];

        updatedMessages[streamingMsgIndex] = messageToFlush;
        store.set(
          agentChatMessagesComponentFamilyState.atomFamily(atomKey),
          updatedMessages,
        );
      } else {
        store.set(agentChatMessagesComponentFamilyState.atomFamily(atomKey), [
          ...currentMessages,
          messageToFlush,
        ]);
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
          store.set(currentAIChatThreadTitleState.atom, titlePart.data.title);
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

          store.set(agentChatUsageState.atom, (prev) => ({
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

      store.set(agentChatIsStreamingState.atom, false);
    };

    const handleEvent = (event: AgentChatSubscriptionEvent) => {
      switch (event.type) {
        case 'stream-chunk': {
          if (
            isDefined(event.seq) &&
            store.get(agentChatFirstLiveSeqState.atom) === null
          ) {
            store.set(agentChatFirstLiveSeqState.atom, event.seq);
          }

          if (!store.get(agentChatIsStreamingState.atom)) {
            store.set(agentChatIsStreamingState.atom, true);

            bridge = new TransformStream<UIMessageChunk>();
            store.set(
              agentChatStreamWriterState.atom,
              bridge.writable.getWriter(),
            );

            const adaptedReadable = bridge.readable.pipeThrough(
              createMidStreamAdapter(),
            );

            startReadLoop(adaptedReadable).catch(() => {
              store.set(agentChatIsStreamingState.atom, false);
            });
          }

          const writer = store.get(agentChatStreamWriterState.atom);

          if (isDefined(writer)) {
            writer.write(event.chunk as UIMessageChunk).catch(() => {});
          }
          break;
        }

        case 'message-persisted': {
          const writer = store.get(agentChatStreamWriterState.atom);

          if (isDefined(writer)) {
            writer.close().catch(() => {});
            store.set(agentChatStreamWriterState.atom, null);
          }

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
          store.set(agentChatErrorState.atom, streamError);

          const writer = store.get(agentChatStreamWriterState.atom);

          if (isDefined(writer)) {
            writer.close().catch(() => {});
            store.set(agentChatStreamWriterState.atom, null);
          }

          store.set(agentChatIsStreamingState.atom, false);
          break;
        }
      }
    };

    store.set(agentChatHandleEventCallbackState.atom, () => handleEvent);

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
          cleanup();
        },
      },
    );

    store.set(agentChatSubscriptionDisposeState.atom, () => dispose);

    return () => {
      store.set(agentChatHandleEventCallbackState.atom, null);
      if (isDefined(throttleTimer)) {
        clearTimeout(throttleTimer);
      }
      cleanup();
    };
  }, [threadId, sseClient, store, cleanup]);
};
