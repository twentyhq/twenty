import * as fs from 'fs';
import * as path from 'path';
import * as prettier from 'prettier';

import { isDefined } from 'twenty-shared/utils';

import { MODELS_DEV_API_URL } from 'src/engine/metadata-modules/ai/ai-models/constants/models-dev.const';
import { type ModelsDevData } from 'src/engine/metadata-modules/ai/ai-models/types/models-dev-data.type';

import { assertPayloadIsUsable } from './utils/assert-payload-is-usable.util';
import { buildCatalog } from './utils/build-catalog.util';
import { enrichCatalog } from './utils/enrich-catalog.util';
import { fetchArtificialAnalysisBenchmarks } from './utils/fetch-artificial-analysis-benchmarks.util';
import { readCommittedBenchmarks } from './utils/read-committed-benchmarks.util';
import { buildCoverageReport } from './utils/build-coverage-report.util';
import { renderCoverageReport } from './utils/render-coverage-report.util';
import { type BenchmarkIndex } from './types/benchmark-index.type';

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

  const data: ModelsDevData = await response.json();

  assertPayloadIsUsable(data);

  return data;
};

// A leaderboard outage must never break the model catalog, so a failed fetch
// degrades to an empty index and the catalog is written without benchmarks.
const fetchBenchmarks = async (): Promise<BenchmarkIndex> => {
  const apiKey = process.env.ARTIFICIAL_ANALYSIS_API_KEY;

  if (!isDefined(apiKey) || apiKey.length === 0) {
    warn('Skipping benchmarks: ARTIFICIAL_ANALYSIS_API_KEY is not set');

    return new Map();
  }

  try {
    const index = await fetchArtificialAnalysisBenchmarks(apiKey);

    log(`Fetched ${index.size} model aliases from Artificial Analysis`);

    return index;
  } catch (error) {
    warn(
      `Skipping benchmarks: ${error instanceof Error ? error.message : String(error)}`,
    );

    return new Map();
  }
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

  const fetched = await fetchBenchmarks();

  // A failed fetch must not delete measurements we already published: the
  // catalog PR is automerged, so an empty index would silently strip every
  // benchmark until the next healthy run.
  const benchmarkIndex =
    fetched.size > 0 ? fetched : readCommittedBenchmarks(BENCHMARKS_PATH);

  if (fetched.size === 0 && benchmarkIndex.size > 0) {
    warn(
      `Reusing ${benchmarkIndex.size} committed benchmark aliases from a previous run`,
    );
  }

  const catalog = buildCatalog(modelsDevData);

  const overlay = enrichCatalog({
    catalog,
    modelsDevData,
    benchmarkIndex,
    measuredAt,
  });

  const renderedReport = renderCoverageReport(buildCoverageReport(catalog));

  log(`\n${renderedReport}\n`);

  if (isDefined(reportPath)) {
    fs.writeFileSync(reportPath, `${renderedReport}\n`, 'utf-8');
  }

  if (dryRun) {
    log('[DRY RUN] Skipping writes');

    return;
  }

  await writeJson(CATALOG_PATH, catalog);
  await writeJson(BENCHMARKS_PATH, {
    source: 'artificialanalysis.ai',
    measuredAt,
    models: overlay,
  });
};

main().catch((error) => {
  // oxlint-disable-next-line no-console
  console.error('AI catalog sync failed:', error);
  process.exit(1);
});
