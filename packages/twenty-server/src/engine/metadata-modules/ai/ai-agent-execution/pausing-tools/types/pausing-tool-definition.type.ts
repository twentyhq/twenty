import { type z } from 'zod';

import { type PausingToolAsk } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-ask.type';

export type PausingToolDefinition<TInput, TOutput> = {
  inputSchema: z.ZodType<TInput>;
  // The output a person may submit depends on what the call asked, so the
  // schema is built from the call's input.
  outputSchema: (input: TInput) => z.ZodType<TOutput>;
  isAwaitingOutput: (toolOutput: unknown) => boolean;
  buildAsk: (input: TInput) => PausingToolAsk;
  toToolResult: (output: TOutput, input: TInput) => Record<string, unknown>;
  toSkippedToolResult: (input: TInput) => Record<string, unknown>;
  toAnswerText: (output: TOutput, input: TInput) => string;
};
