import { isDefined } from 'twenty-shared/utils';

import { type AiModelBenchmarks } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-benchmarks.type';
import { type ModelsDevData } from 'src/engine/metadata-modules/ai/ai-models/types/models-dev-data.type';

import { matchBenchmarks } from './match-benchmarks';
import {
  type BenchmarkIndex,
  type GeneratedCatalog,
  type ObservedPrices,
} from './types';

// The overlay is the cross-repo artifact: it carries what the catalog embeds
// plus the alias set and price observations that only a joining consumer needs.
// The measurement fields are optional because a model the publisher priced but
// never measured earns an entry for its price alone, and stamping that with a
// measuredAt would present a price as a measurement.
export type BenchmarkOverlayEntry = Partial<AiModelBenchmarks> & {
  aliases: string[];
  artificialAnalysisPrices?: ObservedPrices;
};

export type EnrichCatalogArgs = {
  catalog: GeneratedCatalog;
  modelsDevData: ModelsDevData;
  benchmarkIndex: BenchmarkIndex;
  measuredAt: string;
};

export const enrichCatalog = ({
  catalog,
  modelsDevData,
  benchmarkIndex,
  measuredAt,
}: EnrichCatalogArgs): Record<string, BenchmarkOverlayEntry> => {
  const overlay: Record<string, BenchmarkOverlayEntry> = {};

  for (const [providerName, provider] of Object.entries(catalog)) {
    const siblingModels = modelsDevData[providerName]?.models ?? {};

    provider.models = provider.models.map((model) => {
      const match = matchBenchmarks({
        modelName: model.name,
        siblingModels,
        benchmarkIndex,
        measuredAt,
      });

      if (!isDefined(match)) {
        return model;
      }

      overlay[model.name] = {
        ...match.benchmarks,
        aliases: match.aliases,
        artificialAnalysisPrices: match.observedPrices,
      };

      if (!isDefined(match.benchmarks)) {
        return model;
      }

      const { isDeprecated, ...rest } = model;

      return {
        ...rest,
        benchmarks: match.benchmarks,
        ...(isDefined(isDeprecated) ? { isDeprecated } : {}),
      };
    });
  }

  return overlay;
};
