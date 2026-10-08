import { type AiModelEffort } from 'twenty-shared/ai';

import { type AiModelBenchmark } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-benchmark.type';

// Aliases let a joining consumer find the reading under the publisher's own spelling
export type BenchmarkOverlayReading = AiModelBenchmark & {
  aliases: string[];
};

// Per-effort readings nest under the model entry so top-level-only consumers keep working
export type BenchmarkOverlayEntry = BenchmarkOverlayReading & {
  benchmarkByEffort?: Partial<Record<AiModelEffort, BenchmarkOverlayReading>>;
};
