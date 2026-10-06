import { type AgentRunSummary } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-summary.type';

export type AgentRunPausedToolResult = {
  toolName: string;
  output: unknown;
};

export type AgentRunnerOutcome =
  | { status: 'COMPLETED'; result: object }
  | { status: 'NO_CREDITS' }
  | { status: 'AWAITING_ANSWER' }
  // paused on a call that is not a question, such as a wait the caller resolves itself.
  // Only a recorded pause can be continued, since continuing reads the conversation
  | {
      status: 'PAUSED';
      isResumable: boolean;
      pausedToolResults: AgentRunPausedToolResult[];
    };

export type AgentRunnerResult = {
  threadId: string;
  outcome: AgentRunnerOutcome;
  summary: AgentRunSummary;
};
