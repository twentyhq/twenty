import { isDefined } from 'twenty-shared/utils';

import { buildEffortLookupKey } from './build-effort-lookup-key.util';
import { normalizeModelName } from './normalize-model-name.util';
import { parseArtificialAnalysisEffort } from './parse-artificial-analysis-effort.util';
import { type BenchmarkIndex } from '../types/benchmark-index.type';
import { type BenchmarkRecord } from '../types/benchmark-record.type';

const DEFAULT_ARTIFICIAL_ANALYSIS_API_URL =
  'https://artificialanalysis.ai/api/v2/language/models/free';

const PAGE_SIZE = 200;

type ArtificialAnalysisModel = Record<string, unknown> & {
  id?: string;
  slug?: string;
  name?: string;
};

type ArtificialAnalysisPage = {
  data?: unknown;
  pagination?: { has_more?: unknown };
};

// This endpoint returns 0 for "not measured", and a zero tokens-per-second is a
// lie rather than a datum.
const readPositiveNumber = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : undefined;

const readNested = ({
  model,
  path,
}: {
  model: ArtificialAnalysisModel;
  path: string[];
}): number | undefined => {
  let current: unknown = model;

  for (const key of path) {
    if (typeof current !== 'object' || current === null) {
      return undefined;
    }

    current = (current as Record<string, unknown>)[key];
  }

  return readPositiveNumber(current);
};

const readModels = (page: ArtificialAnalysisPage): ArtificialAnalysisModel[] =>
  Array.isArray(page.data) ? (page.data as ArtificialAnalysisModel[]) : [];

// How much a row actually says. The endpoint carries several rows per model and
// some hosts publish no measurements at all, so an unmeasured row must never
// displace a measured one under the same key.
const informationScore = (record: BenchmarkRecord): number =>
  [
    record.intelligenceIndex,
    record.outputTokensPerSecond,
    record.costPerTask,
  ].filter(isDefined).length;

// The rows for one model are the same model at different reasoning efforts, and
// the publisher spells the effort only inside a display name. Taking the
// best-scoring row gives every model its ceiling, measured the same way, which
// is the whole reason for standing on one publisher. Picking by how populated a
// row happened to be scored Sonnet 4.6 at low effort against Sonnet 5 at max,
// and the gap read as a capability difference.
const preferOver = (
  candidate: BenchmarkRecord,
  existing: BenchmarkRecord,
): boolean => {
  const candidateIndex = candidate.intelligenceIndex ?? -1;
  const existingIndex = existing.intelligenceIndex ?? -1;

  if (candidateIndex !== existingIndex) {
    return candidateIndex > existingIndex;
  }

  return informationScore(candidate) > informationScore(existing);
};

const fetchPage = async ({
  url,
  apiKey,
  page,
}: {
  url: string;
  apiKey: string;
  page: number;
}): Promise<ArtificialAnalysisPage> => {
  const pageUrl = new URL(url);

  pageUrl.searchParams.set('page', String(page));
  pageUrl.searchParams.set('page_size', String(PAGE_SIZE));

  const response = await fetch(pageUrl, {
    headers: { 'x-api-key': apiKey },
    signal: AbortSignal.timeout(60000),
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return (await response.json()) as ArtificialAnalysisPage;
};

// The list is paginated and the free tier allows ten requests a day, so every
// page is read in one run rather than spread across runs.
const fetchAllModels = async ({
  url,
  apiKey,
}: {
  url: string;
  apiKey: string;
}): Promise<ArtificialAnalysisModel[]> => {
  const models: ArtificialAnalysisModel[] = [];

  for (let page = 1; ; page += 1) {
    const response = await fetchPage({ url, apiKey, page });

    models.push(...readModels(response));

    if (response.pagination?.has_more !== true) {
      return models;
    }
  }
};

export const fetchArtificialAnalysisBenchmarks = async (
  apiKey: string,
): Promise<BenchmarkIndex> => {
  const url =
    process.env.ARTIFICIAL_ANALYSIS_API_URL ??
    DEFAULT_ARTIFICIAL_ANALYSIS_API_URL;

  const models = await fetchAllModels({ url, apiKey });

  if (models.length === 0) {
    throw new Error(`No models in response from ${url}`);
  }

  const index: BenchmarkIndex = new Map();

  const file = (key: string, record: BenchmarkRecord): void => {
    const existing = index.get(key);

    if (!isDefined(existing) || preferOver(record, existing)) {
      index.set(key, record);
    }
  };

  for (const model of models) {
    // One malformed row must not cost us every measurement in the response.
    if (typeof model !== 'object' || model === null) {
      continue;
    }

    const aliases = [model.slug, model.id, model.name].filter(isDefined);

    // Cost per task is the price of one task of the intelligence index run at
    // this row's effort, so it reflects reasoning volume where per-token
    // pricing cannot.
    const record: BenchmarkRecord = {
      intelligenceIndex: readNested({
        model,
        path: ['evaluations', 'artificial_analysis_intelligence_index'],
      }),
      outputTokensPerSecond: readNested({
        model,
        path: ['performance', 'median_output_tokens_per_second'],
      }),
      costPerTask: readNested({
        model,
        path: [
          'artificial_analysis_intelligence_index_cost',
          'cost_per_task',
          'total_cost',
        ],
      }),
      effort:
        typeof model.name === 'string'
          ? parseArtificialAnalysisEffort(model.name)
          : undefined,
      aliases,
    };

    if (informationScore(record) === 0) {
      continue;
    }

    for (const alias of aliases) {
      const key = normalizeModelName(alias);

      if (key.length === 0) {
        continue;
      }

      // The bare key keeps the ceiling; the effort key lets a pinned variant
      // read the figure taken at its own effort.
      file(key, record);

      if (isDefined(record.effort)) {
        file(buildEffortLookupKey(key, record.effort), record);
      }
    }
  }

  if (index.size === 0) {
    throw new Error(
      `${models.length} models returned from ${url} but none carried a measurement`,
    );
  }

  return index;
};
