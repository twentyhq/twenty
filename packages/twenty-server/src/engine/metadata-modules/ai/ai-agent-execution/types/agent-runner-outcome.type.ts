import { type AgentRunPausedToolResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-paused-tool-result.type';

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
