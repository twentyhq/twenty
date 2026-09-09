import { type AiModelBenchmarks } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-benchmarks.type';

import { type ObservedPrices } from './observed-prices.type';

// The overlay is the cross-repo artifact: it carries what the catalog embeds
// plus the alias set and price observations that only a joining consumer needs.
// The measurement fields are optional because a model the publisher priced but
// never measured earns an entry for its price alone, and stamping that with a
// measuredAt would present a price as a measurement.
export type BenchmarkOverlayEntry = Partial<AiModelBenchmarks> & {
  aliases: string[];
  artificialAnalysisPrices?: ObservedPrices;
};
