import { type ProposedToolCallAnswer } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/proposed-tool-call-answer.type';
import { type AgentRunnerOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-outcome.type';

// what a caller gets once it stops waiting: how its run ended, or the answer to a call it posted itself
export type AgentRunCallerOutcome =
  | Exclude<AgentRunnerOutcome, { status: 'SUSPENDED' }>
  | { status: 'ANSWERED'; answer: ProposedToolCallAnswer };
