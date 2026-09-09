import * as fs from 'fs';
import * as path from 'path';
import * as prettier from 'prettier';

import { isDefined } from 'twenty-shared/utils';

import { MODELS_DEV_API_URL } from 'src/engine/metadata-modules/ai/ai-models/constants/models-dev.const';
import { type AiModelBenchmarks } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-benchmarks.type';
import { type ModelsDevData } from 'src/engine/metadata-modules/ai/ai-models/types/models-dev-data.type';

import { buildCatalog } from './build-catalog';
import { fetchArtificialAnalysisBenchmarks } from './fetch-artificial-analysis';
import { fetchEpochBenchmarks } from './fetch-epoch-benchmarks';
import { matchBenchmarks } from './match-benchmarks';
import { buildCoverageReport, renderCoverageReport } from './report-coverage';
import { type BenchmarkIndex, type GeneratedCatalog } from './types';

const AI_MODELS_DIR = path.resolve(
  __dirname,
  '..',
  '..',
  'src',
  'engine',
  'metadata-modules',
  'ai',
  'ai-models',
);

const CATALOG_PATH = path.join(AI_MODELS_DIR, 'ai-providers.json');
const BENCHMARKS_PATH = path.join(AI_MODELS_DIR, 'ai-model-benchmarks.json');

// oxlint-disable no-console
const log = console.log;
const warn = console.warn;
// oxlint-enable no-console

const readArgument = (flag: string): string | undefined => {
  const index = process.argv.indexOf(flag);

  return index === -1 ? undefined : process.argv[index + 1];
};

const fetchModelsDev = async (): Promise<ModelsDevData> => {
  const response = await fetch(MODELS_DEV_API_URL, {
    signal: AbortSignal.timeout(120000),
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.json();
};

// A leaderboard outage must never break the model catalog, so every benchmark
// source degrades to an empty index instead of failing the sync.
const fetchOptionalIndex = async (
  sourceName: string,
  fetcher: () => Promise<BenchmarkIndex>,
): Promise<BenchmarkIndex> => {
  try {
    const index = await fetcher();

    log(`Fetched ${index.size} model aliases from ${sourceName}`);

    return index;
  } catch (error) {
    warn(
      `Skipping ${sourceName}: ${error instanceof Error ? error.message : String(error)}`,
    );

    return new Map();
  }
};

type EnrichCatalogArgs = {
  catalog: GeneratedCatalog;
  modelsDevData: ModelsDevData;
  epochIndex: BenchmarkIndex;
  artificialAnalysisIndex: BenchmarkIndex;
  measuredAt: string;
};

type BenchmarkOverlayEntry = AiModelBenchmarks & { aliases: string[] };

const enrichCatalog = ({
  catalog,
  modelsDevData,
  epochIndex,
  artificialAnalysisIndex,
  measuredAt,
}: EnrichCatalogArgs): Record<string, BenchmarkOverlayEntry> => {
  const overlay: Record<string, BenchmarkOverlayEntry> = {};

  for (const [providerName, provider] of Object.entries(catalog)) {
    const siblingModels = modelsDevData[providerName]?.models ?? {};

    provider.models = provider.models.map((model) => {
      const match = matchBenchmarks({
        modelName: model.name,
        siblingModels,
        epochIndex,
        artificialAnalysisIndex,
        measuredAt,
      });

      if (!isDefined(match)) {
        return model;
      }

      overlay[model.name] = { ...match.benchmarks, aliases: match.aliases };

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

const writeJson = async (filePath: string, value: unknown): Promise<void> => {
  const prettierConfig = await prettier.resolveConfig(filePath);

  const formatted = await prettier.format(
    JSON.stringify(value, null, 2) + '\n',
    { ...prettierConfig, filepath: filePath },
  );

  fs.writeFileSync(filePath, formatted, 'utf-8');
  log(`Wrote ${filePath}`);
};

const main = async (): Promise<void> => {
  const dryRun = process.argv.includes('--dry-run');
  const reportPath = readArgument('--report');
  const measuredAt = new Date().toISOString().slice(0, 10);

  log('Fetching models.dev API...');

  const modelsDevData = await fetchModelsDev();

  log(`Fetched ${Object.keys(modelsDevData).length} providers from models.dev`);

  const [epochIndex, artificialAnalysisIndex] = await Promise.all([
    fetchOptionalIndex('Epoch AI', fetchEpochBenchmarks),
    (() => {
      const apiKey = process.env.ARTIFICIAL_ANALYSIS_API_KEY;

      if (!isDefined(apiKey) || apiKey.length === 0) {
        warn(
          'Skipping Artificial Analysis: ARTIFICIAL_ANALYSIS_API_KEY is not set',
        );

        return Promise.resolve<BenchmarkIndex>(new Map());
      }

      return fetchOptionalIndex('Artificial Analysis', () =>
        fetchArtificialAnalysisBenchmarks(apiKey),
      );
    })(),
  ]);

  const catalog = buildCatalog(modelsDevData);

  const overlay = enrichCatalog({
    catalog,
    modelsDevData,
    epochIndex,
    artificialAnalysisIndex,
    measuredAt,
  });

  const report = buildCoverageReport(catalog);
  const renderedReport = renderCoverageReport(report);

  log(`\n${renderedReport}\n`);

  if (isDefined(reportPath)) {
    fs.writeFileSync(reportPath, `${renderedReport}\n`, 'utf-8');
  }

  if (dryRun) {
    log('[DRY RUN] Skipping writes');

    return;
  }

  await writeJson(CATALOG_PATH, catalog);
  await writeJson(BENCHMARKS_PATH, { measuredAt, models: overlay });
};

main().catch((error) => {
  // oxlint-disable-next-line no-console
  console.error('AI catalog sync failed:', error);
  process.exit(1);
});
