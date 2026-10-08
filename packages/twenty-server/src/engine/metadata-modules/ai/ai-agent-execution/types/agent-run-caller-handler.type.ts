import { type AgentRunSummary } from 'twenty-shared/ai';

import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';
import { type AgentRunCallerInput } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-input.type';
import { type AgentRunCallerOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-outcome.type';
import { type AgentRunCallerWaitingState } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-waiting-state.type';
import { type AgentRunExecutionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-execution-context.type';

export type AgentRunCallerHandler<
  TCaller extends AgentRunCaller = AgentRunCaller,
> = {
  buildExecutionContext(
    input: AgentRunCallerInput<TCaller>,
  ): Promise<AgentRunExecutionContext>;

  getWaitingState(
    input: AgentRunCallerInput<TCaller>,
  ): Promise<AgentRunCallerWaitingState>;

  // absent for a caller that only records the run, whose outcome is already in its conversation
  onOutcome?(
    input: AgentRunCallerInput<TCaller> & {
      threadId: string;
      outcome: AgentRunCallerOutcome;
      // null when the run recorded none
      summary: AgentRunSummary | null;
    },
  ): Promise<void>;
};
