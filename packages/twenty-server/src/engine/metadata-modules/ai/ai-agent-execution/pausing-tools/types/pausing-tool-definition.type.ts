import { type z } from 'zod';

import { type PausingToolAsk } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-ask.type';
import { type PausingToolCompletion } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-completion.type';
import { type PausingToolCompletionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-completion-context.type';

export type PausingToolDefinition<TInput, TOutput> = {
  inputSchema: z.ZodType<TInput>;
  // The output a person may submit depends on what the call asked, so the
  // schema is built from the call's input.
  outputSchema: (input: TInput) => z.ZodType<TOutput>;
  isAwaitingOutput: (toolOutput: unknown) => boolean;
  buildAsk: (input: TInput) => PausingToolAsk;
  // Runs once the person's output is accepted, and only then: whatever the
  // call does on the person's behalf happens here, and the tool result says
  // what came of it.
  complete: (args: {
    output: TOutput;
    input: TInput;
    context: PausingToolCompletionContext;
  }) => Promise<PausingToolCompletion>;
  toSkippedToolResult: (input: TInput) => Record<string, unknown>;
};
