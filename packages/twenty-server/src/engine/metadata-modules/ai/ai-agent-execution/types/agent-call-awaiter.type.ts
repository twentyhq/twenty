import { type PendingWakeUpEntity } from 'src/engine/core-modules/pending-wake-up/entities/pending-wake-up.entity';
import { type AgentRunEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-run.entity';
import { type AgentRunCallerWaitingState } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-waiting-state.type';

// what takes the answer to a call: the suspended run that asked it, or the wake-up of the caller that posted it
export type AgentCallAwaiter = { status: AgentRunCallerWaitingState } & (
  | { run: AgentRunEntity }
  | { wakeUp: PendingWakeUpEntity }
);
