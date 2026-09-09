import { type AiModelBenchmark } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-benchmark.type';

// The overlay is the cross-repo artifact: it carries what the catalog embeds
// plus the alias set a joining consumer needs to find the model under the
// publisher's own spelling.
export type BenchmarkOverlayEntry = AiModelBenchmark & {
  aliases: string[];
};
