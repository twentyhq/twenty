import { type ModelsDevModel } from 'src/engine/metadata-modules/ai/ai-models/types/models-dev-model.type';

import { type BenchmarkIndex } from './benchmark-index.type';

export type MatchBenchmarksArgs = {
  modelName: string;
  siblingModels: Record<string, ModelsDevModel>;
  benchmarkIndex: BenchmarkIndex;
  measuredAt: string;
};
