import { type ModelsDevData } from 'src/engine/metadata-modules/ai/ai-models/types/models-dev-data.type';

import { type BenchmarkIndex } from './benchmark-index.type';
import { type GeneratedCatalog } from './generated-catalog.type';

export type EnrichCatalogArgs = {
  catalog: GeneratedCatalog;
  modelsDevData: ModelsDevData;
  benchmarkIndex: BenchmarkIndex;
  measuredAt: string;
};
