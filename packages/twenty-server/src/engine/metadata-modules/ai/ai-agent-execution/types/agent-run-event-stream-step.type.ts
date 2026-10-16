import { type AgentRunEvent } from 'twenty-shared/application';

import { type AgentRunEventStreamState } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-event-stream-state.type';

export type AgentRunEventStreamStep = {
  state: AgentRunEventStreamState;
  events: AgentRunEvent[];
};
