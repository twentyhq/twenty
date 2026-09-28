// What billing reads out of a model call, whichever kind of model made it.
// LanguageModelUsage satisfies it structurally; an evaluation model reports
// token counts and nothing else, so the details are optional.
export type BillingTokenUsage = {
  inputTokens?: number;
  outputTokens?: number;
  inputTokenDetails?: {
    cacheReadTokens?: number;
  };
  outputTokenDetails?: {
    reasoningTokens?: number;
  };
};
