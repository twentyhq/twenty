import { type AgentRunSummary } from 'twenty-shared/ai';
import { type PendingWakeUpCondition } from 'twenty-shared/pending-wake-up';

import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { type AgentRunnerOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-outcome.type';

export type AgentRunContinuationCompletion = {
  turnId: string;
  execution: Pick<AgentExecutionResult, 'result' | 'stopReason' | 'isPaused'>;
  summary: AgentRunSummary;
  waitCondition: PendingWakeUpCondition | null;
  isAborted: boolean;
  isAwaitingAnswer: boolean;
  questionMessageId: string | null;
  settledOutcome?: AgentRunnerOutcome;
};
