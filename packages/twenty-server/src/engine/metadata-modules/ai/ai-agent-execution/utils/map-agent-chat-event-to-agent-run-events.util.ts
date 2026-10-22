import { isNonEmptyString } from '@sniptt/guards';
import { type UIMessageChunk } from 'ai';
import { type AgentChatSubscriptionEvent } from 'twenty-shared/ai';
import { type AgentRunStopReason } from 'twenty-shared/application';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type AgentRunEventStreamState } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-event-stream-state.type';
import { type AgentRunEventStreamStep } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-event-stream-step.type';
import { buildAgentRunMessageEvent } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-message-event.util';
import { buildAgentRunStatusEvent } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-status-event.util';
import { buildAgentRunToolResultEvent } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-tool-result-event.util';
import { buildAgentRunToolUseEvent } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-tool-use-event.util';
import { createAgentRunEventStreamState } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/create-agent-run-event-stream-state.util';
import { AGENT_TURN_CREDITS_EXHAUSTED_ERROR } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-turn-credits-exhausted-error.constant';

// the next stream numbers its chunks from 1 again
const endStream = (state: AgentRunEventStreamState): AgentRunEventStreamState =>
  createAgentRunEventStreamState(state.threadId);

const mapChunk = (
  state: AgentRunEventStreamState,
  chunk: UIMessageChunk,
): AgentRunEventStreamStep => {
  switch (chunk.type) {
    case 'start': {
      const messageId = chunk.messageId ?? state.threadId;
      const turnId = isPlainObject(chunk.messageMetadata)
        ? chunk.messageMetadata.turnId
        : undefined;

      return {
        state: {
          ...state,
          messageId,
          turnId: isNonEmptyString(turnId) ? turnId : null,
          textParts: {},
          textPartCount: 0,
        },
        events: [
          buildAgentRunStatusEvent({
            sourceId: messageId,
            status: { type: 'session.status_running' },
          }),
        ],
      };
    }
    case 'text-start':
      return {
        state: {
          ...state,
          textParts: {
            ...state.textParts,
            [chunk.id]: { index: state.textPartCount, text: '' },
          },
          textPartCount: state.textPartCount + 1,
        },
        events: [],
      };
    case 'text-delta': {
      const textPart = state.textParts[chunk.id];

      if (!isDefined(textPart)) {
        return { state, events: [] };
      }

      return {
        state: {
          ...state,
          textParts: {
            ...state.textParts,
            [chunk.id]: { ...textPart, text: textPart.text + chunk.delta },
          },
        },
        events: [],
      };
    }
    case 'text-end': {
      const { [chunk.id]: textPart, ...otherTextParts } = state.textParts;

      return {
        state: { ...state, textParts: otherTextParts },
        events:
          isDefined(textPart) &&
          isDefined(state.messageId) &&
          isNonEmptyString(textPart.text)
            ? [
                buildAgentRunMessageEvent({
                  messageId: state.messageId,
                  role: 'assistant',
                  textIndex: textPart.index,
                  text: textPart.text,
                }),
              ]
            : [],
      };
    }
    case 'tool-input-available':
      return {
        state,
        events: [
          buildAgentRunToolUseEvent({
            toolCallId: chunk.toolCallId,
            name: chunk.toolName,
            input: chunk.input,
          }),
        ],
      };
    case 'tool-input-error':
      return {
        state,
        events: [
          buildAgentRunToolUseEvent({
            toolCallId: chunk.toolCallId,
            name: chunk.toolName,
            input: chunk.input,
          }),
          buildAgentRunToolResultEvent({
            toolCallId: chunk.toolCallId,
            output: chunk.errorText,
            isError: true,
          }),
        ],
      };
    case 'tool-output-available':
      return {
        state,
        events: chunk.preliminary
          ? []
          : [
              buildAgentRunToolResultEvent({
                toolCallId: chunk.toolCallId,
                output: chunk.output,
                isError: false,
              }),
            ],
      };
    case 'tool-output-error':
      return {
        state,
        events: [
          buildAgentRunToolResultEvent({
            toolCallId: chunk.toolCallId,
            output: chunk.errorText,
            isError: true,
          }),
        ],
      };
    default:
      return { state, events: [] };
  }
};

export const mapAgentChatEventToAgentRunEvents = ({
  state,
  event,
  idleStopReason = 'end_turn',
}: {
  state: AgentRunEventStreamState;
  event: AgentChatSubscriptionEvent;
  idleStopReason?: AgentRunStopReason;
}): AgentRunEventStreamStep => {
  switch (event.type) {
    case 'stream-chunk': {
      const chunk = event.chunk as UIMessageChunk;
      const isReplayed =
        isDefined(event.seq) && event.seq <= state.skipChunksUpToSeq;
      const isNextStream =
        chunk.type === 'start' && chunk.messageId !== state.messageId;

      if (isReplayed && !isNextStream) {
        return { state, events: [] };
      }

      return mapChunk(
        isReplayed ? { ...state, skipChunksUpToSeq: 0 } : state,
        chunk,
      );
    }
    // a member's message is persisted too, but only the reply streamed here ends the turn
    case 'message-persisted':
      return {
        state: endStream(state),
        events:
          event.messageId === state.messageId
            ? [
                buildAgentRunStatusEvent({
                  sourceId: event.messageId,
                  status: {
                    type: 'session.status_idle',
                    stopReason: idleStopReason,
                  },
                }),
              ]
            : [],
      };
    case 'stream-error':
    case 'credits-exhausted':
      return {
        state: endStream(state),
        events: [
          buildAgentRunStatusEvent({
            // keyed by turn, as the listed history keys a failed turn
            sourceId: state.turnId ?? state.messageId ?? state.threadId,
            status: {
              type: 'session.error',
              error:
                event.type === 'stream-error'
                  ? { code: event.code, message: event.message }
                  : AGENT_TURN_CREDITS_EXHAUSTED_ERROR,
            },
          }),
        ],
      };
    default:
      return { state, events: [] };
  }
};
