import { type AgentRunEventStreamState } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-event-stream-state.type';
import { type AgentRunEventStreamStep } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-event-stream-step.type';
import { mapAgentChatEventToAgentRunEvents } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-agent-chat-event-to-agent-run-events.util';

// a subscriber joining mid-turn gets the turn so far, then only the chunks after it
export const replayAgentChatChunks = ({
  state,
  chunks,
  maxSeq,
}: {
  state: AgentRunEventStreamState;
  chunks: Record<string, unknown>[];
  maxSeq: number;
}): AgentRunEventStreamStep => {
  const replayed = chunks.reduce<AgentRunEventStreamStep>(
    (step, chunk) => {
      const next = mapAgentChatEventToAgentRunEvents({
        state: step.state,
        event: { type: 'stream-chunk', chunk },
      });

      return { state: next.state, events: [...step.events, ...next.events] };
    },
    { state, events: [] },
  );

  return {
    state: { ...replayed.state, skipChunksUpToSeq: maxSeq },
    events: replayed.events,
  };
};
