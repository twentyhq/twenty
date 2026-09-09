import { type ObservedPrices } from './observed-prices.type';

export type BenchmarkRecord = {
  intelligenceIndex?: number;
  outputTokensPerSecond?: number;
  timeToFirstTokenSeconds?: number;
  costPerTask?: number;
  // Kept out of the catalog on purpose: an observation only corroborates
  // models.dev while it stays independent of it.
  observedPrices?: ObservedPrices;
  // Set only on a record recovered from the committed overlay, so preserved
  // measurements keep the date they were actually taken.
  measuredAt?: string;
  aliases: string[];
};
