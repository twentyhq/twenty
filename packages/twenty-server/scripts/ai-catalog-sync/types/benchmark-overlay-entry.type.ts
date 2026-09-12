import { type AiModelEffort } from 'twenty-shared/ai';

import { type AiModelBenchmark } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-benchmark.type';

// A reading plus the alias set a joining consumer needs to find it under the
// publisher's own spelling.
export type BenchmarkOverlayReading = AiModelBenchmark & {
  aliases: string[];
};

// The overlay is the cross-repo artifact: it carries what the catalog embeds
// plus the aliases. Per-effort readings nest under the model's entry so a
// consumer that reads only the top-level fields keeps working.
export type BenchmarkOverlayEntry = BenchmarkOverlayReading & {
  benchmarkByEffort?: Partial<Record<AiModelEffort, BenchmarkOverlayReading>>;
};
