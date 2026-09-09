export type BenchmarkRecord = {
  intelligenceIndex?: number;
  outputTokensPerSecond?: number;
  costPerTask?: number;
  // Set only on a record recovered from the committed overlay, so preserved
  // measurements keep the date they were actually taken.
  measuredAt?: string;
  aliases: string[];
};
