import { type AiModelEffort } from 'twenty-shared/ai';

export type BenchmarkRecord = {
  intelligenceIndex?: number;
  outputTokensPerSecond?: number;
  costPerTask?: number;
  // The effort the publisher's row was measured at, when its name says so.
  effort?: AiModelEffort;
  // Set only on a record recovered from the committed overlay, so preserved
  // measurements keep the date they were actually taken.
  measuredAt?: string;
  aliases: string[];
};
