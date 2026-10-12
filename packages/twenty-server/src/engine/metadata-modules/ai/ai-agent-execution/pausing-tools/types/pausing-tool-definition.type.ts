import { type z } from 'zod';

import { type PausingToolCompletion } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-completion.type';
import { type PausingToolCompletionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-completion-context.type';

export type PausingToolDefinition<TInput, TOutput> = {
  inputSchema: z.ZodType<TInput>;
  outputSchema: (
    input: TInput,
    pendingToolOutput: unknown,
  ) => z.ZodType<TOutput>;
  // runs only after the output is accepted, so side effects on the person's behalf belong here
  complete: (args: {
    output: TOutput;
    input: TInput;
    pendingToolOutput: unknown;
    context: PausingToolCompletionContext;
  }) => Promise<PausingToolCompletion>;
  toSkippedToolResult: (
    input: TInput,
    pendingToolOutput: unknown,
  ) => Record<string, unknown>;
  // an answer that runs something is recorded as running first, so it can never be given twice, and
  // closes as interrupted when its outcome never got recorded, without running it again
  toRunningToolResult?: (args: {
    output: TOutput;
    input: TInput;
    pendingToolOutput: unknown;
  }) => Record<string, unknown> | undefined;
  toInterruptedToolResult?: (
    input: TInput,
    runningToolOutput: unknown,
  ) => Record<string, unknown>;
};
