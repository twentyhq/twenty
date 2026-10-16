import {
  type AgentChatSubscriptionEvent,
  type ExtendedUIMessage,
} from 'twenty-shared/ai';
import {
  type AgentRunEvent,
  type AgentRunStopReason,
} from 'twenty-shared/application';

import { type AgentRunEventStreamState } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-event-stream-state.type';
import { createAgentRunEventStreamState } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/create-agent-run-event-stream-state.util';
import { mapAgentChatEventToAgentRunEvents } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-agent-chat-event-to-agent-run-events.util';
import { replayAgentChatChunks } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/replay-agent-chat-chunks.util';
import { mapAgentMessagesToAgentRunEvents } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-agent-messages-to-agent-run-events.util';

const THREAD_ID = 'thread';

const TURN_CHUNKS: Record<string, unknown>[] = [
  { type: 'start', messageId: 'reply' },
  { type: 'start-step' },
  { type: 'text-start', id: 'text-a' },
  { type: 'text-delta', id: 'text-a', delta: 'Looking ' },
  { type: 'text-delta', id: 'text-a', delta: 'up Acme.' },
  { type: 'text-end', id: 'text-a' },
  { type: 'tool-input-start', toolCallId: 'call-1', toolName: 'find' },
  {
    type: 'tool-input-available',
    toolCallId: 'call-1',
    toolName: 'find',
    input: { name: 'Acme' },
  },
  {
    type: 'tool-output-available',
    toolCallId: 'call-1',
    output: { count: 0 },
    preliminary: true,
  },
  { type: 'tool-output-available', toolCallId: 'call-1', output: { count: 1 } },
  { type: 'finish-step' },
  { type: 'start-step' },
  { type: 'text-start', id: 'text-b' },
  { type: 'text-delta', id: 'text-b', delta: 'Found it.' },
  { type: 'text-end', id: 'text-b' },
  { type: 'finish' },
];

const mapEvents = (
  events: AgentChatSubscriptionEvent[],
  {
    state = createAgentRunEventStreamState(THREAD_ID),
    idleStopReason,
  }: {
    state?: AgentRunEventStreamState;
    idleStopReason?: AgentRunStopReason;
  } = {},
) =>
  events.reduce<{
    state: AgentRunEventStreamState;
    events: AgentRunEvent[];
  }>(
    (step, event) => {
      const next = mapAgentChatEventToAgentRunEvents({
        state: step.state,
        event,
        idleStopReason,
      });

      return { state: next.state, events: [...step.events, ...next.events] };
    },
    { state, events: [] },
  );

const toChunkEvents = (
  chunks: Record<string, unknown>[],
  firstSeq = 1,
): AgentChatSubscriptionEvent[] =>
  chunks.map((chunk, index) => ({
    type: 'stream-chunk',
    chunk,
    seq: firstSeq + index,
  }));

describe('mapAgentChatEventToAgentRunEvents', () => {
  it('maps a streamed turn to its status, messages and tool calls', () => {
    const { events } = mapEvents(
      [
        ...toChunkEvents(TURN_CHUNKS),
        { type: 'message-persisted', messageId: 'reply' },
      ],
      { idleStopReason: 'requires_action' },
    );

    expect(events).toEqual([
      { id: 'reply:running', type: 'session.status_running' },
      {
        id: 'reply:text:0',
        type: 'agent.message',
        content: [{ type: 'text', text: 'Looking up Acme.' }],
      },
      {
        id: 'tool_use:call-1',
        type: 'agent.tool_use',
        toolUseId: 'call-1',
        name: 'find',
        input: { name: 'Acme' },
      },
      {
        id: 'tool_result:call-1',
        type: 'agent.tool_result',
        toolUseId: 'call-1',
        output: { count: 1 },
        isError: false,
      },
      {
        id: 'reply:text:1',
        type: 'agent.message',
        content: [{ type: 'text', text: 'Found it.' }],
      },
      {
        id: 'reply:idle',
        type: 'session.status_idle',
        stopReason: 'requires_action',
      },
    ]);
  });

  it('gives a message and its tool calls the ids the listed history gives them', () => {
    const { events } = mapEvents(toChunkEvents(TURN_CHUNKS));
    const historyEvents = mapAgentMessagesToAgentRunEvents([
      {
        id: 'reply',
        role: 'assistant',
        parts: [
          { type: 'step-start' },
          { type: 'text', text: 'Looking up Acme.' },
          {
            type: 'tool-find',
            toolCallId: 'call-1',
            state: 'output-available',
            input: { name: 'Acme' },
            output: { count: 1 },
          },
          { type: 'step-start' },
          { type: 'text', text: 'Found it.' },
        ],
      },
    ] as ExtendedUIMessage[]);

    expect(
      events.filter(({ type }) => type !== 'session.status_running'),
    ).toEqual(historyEvents);
  });

  it('ends the turn only on the reply it streamed', () => {
    const { events } = mapEvents([
      { type: 'message-persisted', messageId: 'member-message' },
      ...toChunkEvents([{ type: 'start', messageId: 'reply' }]),
      { type: 'queue-updated' },
      { type: 'keepalive' },
      { type: 'message-persisted', messageId: 'reply' },
    ]);

    expect(events).toEqual([
      { id: 'reply:running', type: 'session.status_running' },
      { id: 'reply:idle', type: 'session.status_idle', stopReason: 'end_turn' },
    ]);
  });

  it('maps a failed or out-of-credits stream to an error keyed by its turn', () => {
    const { events } = mapEvents([
      ...toChunkEvents([
        {
          type: 'start',
          messageId: 'reply',
          messageMetadata: { turnId: 'turn' },
        },
      ]),
      { type: 'stream-error', code: 'STREAM_INTERRUPTED', message: 'Lost' },
      { type: 'credits-exhausted' },
    ]);

    expect(events).toEqual([
      { id: 'reply:running', type: 'session.status_running' },
      {
        id: 'turn:error',
        type: 'session.error',
        error: { code: 'STREAM_INTERRUPTED', message: 'Lost' },
      },
      {
        id: `${THREAD_ID}:error`,
        type: 'session.error',
        error: {
          code: 'CREDITS_EXHAUSTED',
          message: 'The workspace ran out of credits.',
        },
      },
    ]);
  });
});

describe('replayAgentChatChunks', () => {
  it('replays the turn so far, then skips the live chunks it covered', () => {
    const replayed = replayAgentChatChunks({
      state: createAgentRunEventStreamState(THREAD_ID),
      chunks: TURN_CHUNKS.slice(0, 4),
      maxSeq: 4,
    });

    expect(replayed.events).toEqual([
      { id: 'reply:running', type: 'session.status_running' },
    ]);

    const { events } = mapEvents(
      [
        ...toChunkEvents(TURN_CHUNKS.slice(0, 6)),
        { type: 'message-persisted', messageId: 'reply' },
        ...toChunkEvents([
          { type: 'start', messageId: 'next-reply' },
          { type: 'text-start', id: 'text-c' },
          { type: 'text-delta', id: 'text-c', delta: 'Again.' },
          { type: 'text-end', id: 'text-c' },
        ]),
      ],
      { state: replayed.state },
    );

    expect(events).toEqual([
      {
        id: 'reply:text:0',
        type: 'agent.message',
        content: [{ type: 'text', text: 'Looking up Acme.' }],
      },
      { id: 'reply:idle', type: 'session.status_idle', stopReason: 'end_turn' },
      { id: 'next-reply:running', type: 'session.status_running' },
      {
        id: 'next-reply:text:0',
        type: 'agent.message',
        content: [{ type: 'text', text: 'Again.' }],
      },
    ]);
  });

  it('follows the next stream when it restarts its numbering before the replayed one ended', () => {
    const replayed = replayAgentChatChunks({
      state: createAgentRunEventStreamState(THREAD_ID),
      chunks: TURN_CHUNKS.slice(0, 2),
      maxSeq: 2,
    });

    const { events } = mapEvents(
      toChunkEvents([{ type: 'start', messageId: 'next-reply' }]),
      { state: replayed.state },
    );

    expect(events).toEqual([
      { id: 'next-reply:running', type: 'session.status_running' },
    ]);
  });
});
