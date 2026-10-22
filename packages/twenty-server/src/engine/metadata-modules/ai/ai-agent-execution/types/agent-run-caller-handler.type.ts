import { type AgentRunSummary } from 'twenty-shared/ai';

import { type AgentRunCallerInput } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-input.type';
import { type AgentRunCallerOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-outcome.type';
import { type OwnerWaitingState } from 'src/engine/core-modules/pending-wake-up/types/owner-waiting-state.type';
import { type AgentRunExecutionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-execution-context.type';

export type AgentRunCallerHandler = {
  buildExecutionContext(
    input: AgentRunCallerInput,
  ): Promise<AgentRunExecutionContext>;

  getWaitingState(input: AgentRunCallerInput): Promise<OwnerWaitingState>;

  // a run that paused goes on later; its caller can show where it waits meanwhile
  onSuspended?(
    input: AgentRunCallerInput & {
      threadId: string;
      summary: AgentRunSummary;
    },
  ): Promise<void>;

  // absent for a caller that only records the run, whose outcome is already in its conversation
  onOutcome?(
    input: AgentRunCallerInput & {
      threadId: string;
      outcome: AgentRunCallerOutcome;
      // null when the run recorded none
      summary: AgentRunSummary | null;
    },
  ): Promise<void>;

  // the caller can no longer take the outcome, but something may still wait on the run, such as a request
  onCallerGone?(
    input: AgentRunCallerInput & {
      threadId: string;
      outcome: AgentRunCallerOutcome;
    },
  ): Promise<void>;
};
