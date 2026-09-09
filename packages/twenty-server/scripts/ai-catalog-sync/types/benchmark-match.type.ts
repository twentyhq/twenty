import { type AiModelBenchmarks } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-benchmarks.type';

import { type ObservedPrices } from './observed-prices.type';

export type BenchmarkMatch = {
  // Absent when the publisher lists the model but has measured nothing about
  // it, which is not the same as a model it scored badly.
  benchmarks?: AiModelBenchmarks;
  aliases: string[];
  observedPrices?: ObservedPrices;
};
