import { type AgentRunEventStreamState } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-event-stream-state.type';

export const createAgentRunEventStreamState = (
  threadId: string,
): AgentRunEventStreamState => ({
  threadId,
  messageId: null,
  turnId: null,
  textParts: {},
  textPartCount: 0,
  skipChunksUpToSeq: 0,
});
