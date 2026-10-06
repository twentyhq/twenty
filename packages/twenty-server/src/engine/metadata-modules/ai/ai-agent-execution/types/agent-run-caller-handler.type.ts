import { type ActorMetadata } from 'twenty-shared/types';

import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';
import { type AgentRunCallerWaitingState } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-waiting-state.type';
import { type AgentRunExecutionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-execution-context.type';
import { type AgentRunSummary } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-summary.type';
import { type AgentRunnerOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-outcome.type';

type AgentRunCallerInput = {
  workspaceId: string;
  caller: AgentRunCaller;
};

export type AgentRunCallerHandler = {
  callerType: AgentRunCaller['type'];

  buildExecutionContext(
    input: AgentRunCallerInput,
  ): Promise<AgentRunExecutionContext>;

  resolveTurnAuthor(input: AgentRunCallerInput): Promise<ActorMetadata>;

  getWaitingState(
    input: AgentRunCallerInput,
  ): Promise<AgentRunCallerWaitingState>;

  onOutcome(
    input: AgentRunCallerInput & {
      threadId: string;
      outcome: Exclude<AgentRunnerOutcome, { status: 'SUSPENDED' }>;
      // null for a call the caller posted itself, which no agent ran
      summary: AgentRunSummary | null;
    },
  ): Promise<void>;
};
