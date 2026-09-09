import { type AiModelBenchmark } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-benchmark.type';

export type BenchmarkMatch = {
  benchmark: AiModelBenchmark;
  aliases: string[];
};
