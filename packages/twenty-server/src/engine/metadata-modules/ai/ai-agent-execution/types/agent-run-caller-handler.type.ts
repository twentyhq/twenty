import { type ActorMetadata } from 'twenty-shared/types';

import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';
import { type AgentRunCallerInput } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-input.type';
import { type AgentRunCallerOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-outcome.type';
import { type AgentRunCallerWaitingState } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-waiting-state.type';
import { type AgentRunExecutionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-execution-context.type';
import { type AgentRunSummary } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-summary.type';

export type AgentRunCallerHandler<
  TCaller extends AgentRunCaller = AgentRunCaller,
> = {
  callerType: TCaller['type'];

  buildExecutionContext(
    input: AgentRunCallerInput<TCaller>,
  ): Promise<AgentRunExecutionContext>;

  resolveTurnAuthor(
    input: AgentRunCallerInput<TCaller>,
  ): Promise<ActorMetadata>;

  getWaitingState(
    input: AgentRunCallerInput<TCaller>,
  ): Promise<AgentRunCallerWaitingState>;

  // absent for a caller that only records the run, whose outcome is already in its conversation
  onOutcome?(
    input: AgentRunCallerInput<TCaller> & {
      threadId: string;
      outcome: AgentRunCallerOutcome;
      // null for a call the caller posted itself, which no agent ran
      summary: AgentRunSummary | null;
    },
  ): Promise<void>;
};
