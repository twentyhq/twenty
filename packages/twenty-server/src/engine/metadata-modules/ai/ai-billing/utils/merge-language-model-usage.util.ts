import { type LanguageModelUsage } from 'ai';

const sum = (a: number | undefined, b: number | undefined): number =>
  (a ?? 0) + (b ?? 0);

export const mergeLanguageModelUsage = (
  a: LanguageModelUsage,
  b: LanguageModelUsage,
): LanguageModelUsage => {
  const inA = a.inputTokenDetails;
  const inB = b.inputTokenDetails;
  const outA = a.outputTokenDetails;
  const outB = b.outputTokenDetails;

  return {
    inputTokens: sum(a.inputTokens, b.inputTokens),
    outputTokens: sum(a.outputTokens, b.outputTokens),
    totalTokens: sum(a.totalTokens, b.totalTokens),
    inputTokenDetails: {
      noCacheTokens: sum(inA?.noCacheTokens, inB?.noCacheTokens),
      cacheReadTokens: sum(inA?.cacheReadTokens, inB?.cacheReadTokens),
      cacheWriteTokens: sum(inA?.cacheWriteTokens, inB?.cacheWriteTokens),
    },
    outputTokenDetails: {
      textTokens: sum(outA?.textTokens, outB?.textTokens),
      reasoningTokens: sum(outA?.reasoningTokens, outB?.reasoningTokens),
    },
  };
};
