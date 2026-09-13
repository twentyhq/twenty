import { type AiModelEffort } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type AiModelBenchmark } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-benchmark.type';

import {
  type BenchmarkOverlayEntry,
  type BenchmarkOverlayReading,
} from '../types/benchmark-overlay-entry.type';
import { type EnrichCatalogArgs } from '../types/enrich-catalog-args.type';

import { matchBenchmarks } from './match-benchmarks.util';

// The catalog embeds the figures only; the aliases stay in the overlay, which
// is where a joining consumer looks for them.
const toCatalogReadings = (
  readings: Partial<Record<AiModelEffort, BenchmarkOverlayReading>>,
): Partial<Record<AiModelEffort, AiModelBenchmark>> =>
  Object.fromEntries(
    Object.entries(readings).map(
      ([effort, { aliases: _aliases, ...reading }]) => [effort, reading],
    ),
  );

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
        efforts: model.efforts,
      });

      if (!isDefined(match)) {
        return model;
      }

      const { benchmark, aliases, benchmarkByEffort } = match;

      overlay[model.name] = {
        ...benchmark,
        aliases,
        ...(isDefined(benchmarkByEffort) ? { benchmarkByEffort } : {}),
      };

      const { isDeprecated, ...rest } = model;

      return {
        ...rest,
        benchmark,
        ...(isDefined(benchmarkByEffort)
          ? { benchmarkByEffort: toCatalogReadings(benchmarkByEffort) }
          : {}),
        ...(isDefined(isDeprecated) ? { isDeprecated } : {}),
      };
    });
  }

  return overlay;
};
