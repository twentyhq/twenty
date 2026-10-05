import { type Tool } from 'ai';

import { type PausingToolCall } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-call.type';
import { type PausingToolCallContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-call-context.type';

export type PreparedPausingToolCall =
  | { input: unknown; pendingOutput: Record<string, unknown> }
  | { error: string };

// type-erased so tools with different inputs can share one map
export type PausingTool = {
  // the tool an agent calls; it pauses the conversation on the pending output it returns
  buildTool: (context?: PausingToolCallContext) => Tool;
  // makes a call without an agent, as an application or a workflow step does
  prepareCall: (
    toolInput: unknown,
    context?: PausingToolCallContext,
  ) => Promise<PreparedPausingToolCall>;
  // the pending output carries what the server resolved when the call was made
  parseCall: (
    toolInput: unknown,
    pendingToolOutput?: unknown,
  ) => PausingToolCall | null;
};
