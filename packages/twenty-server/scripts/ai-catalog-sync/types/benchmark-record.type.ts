import { type AiModelEffort } from 'twenty-shared/ai';

export type BenchmarkRecord = {
  intelligenceIndex?: number;
  outputTokensPerSecond?: number;
  costPerTask?: number;
  // The effort the publisher's row was measured at, when its name says so.
  effort?: AiModelEffort;
  // Set only when recovered from the committed overlay, so preserved measurements keep their real date
  measuredAt?: string;
  aliases: string[];
};
