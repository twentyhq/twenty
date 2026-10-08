import { type PausingToolCompletion } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-completion.type';
import { type PausingToolCompletionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-completion-context.type';

export type PausingToolValidation =
  | { isValid: true; output: Record<string, unknown> }
  | { isValid: false; errorMessage: string };

export type PausingToolCall = {
  validate: (output: unknown) => PausingToolValidation;
  // Takes an output validate accepted.
  complete: (args: {
    output: Record<string, unknown>;
    context: PausingToolCompletionContext;
  }) => Promise<PausingToolCompletion>;
  toSkippedToolResult: () => Record<string, unknown>;
  toRunningToolResult?: (
    output: Record<string, unknown>,
  ) => Record<string, unknown> | undefined;
  toInterruptedToolResult?: () => Record<string, unknown>;
};
