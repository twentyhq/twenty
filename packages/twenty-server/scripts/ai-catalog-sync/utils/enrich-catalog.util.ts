import { isDefined } from 'twenty-shared/utils';

import { type BenchmarkOverlayEntry } from '../types/benchmark-overlay-entry.type';
import { type EnrichCatalogArgs } from '../types/enrich-catalog-args.type';

import { matchBenchmarks } from './match-benchmarks.util';

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
