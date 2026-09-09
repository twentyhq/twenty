import { isDefined } from 'twenty-shared/utils';

import { normalizeModelName } from './normalize-model-name.util';
import { type BenchmarkIndex } from '../types/benchmark-index.type';
import { type BenchmarkRecord } from '../types/benchmark-record.type';

const DEFAULT_ARTIFICIAL_ANALYSIS_API_URL =
  'https://artificialanalysis.ai/api/v2/data/llms/models';

type ArtificialAnalysisModel = Record<string, unknown> & {
  id?: string;
  slug?: string;
  name?: string;
};

// This endpoint returns 0 for "not measured", and a zero tokens-per-second is a
// lie rather than a datum.
const readPositiveNumber = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : undefined;

const readNested = ({
  model,
  containerKey,
  leafKey,
}: {
  model: ArtificialAnalysisModel;
  containerKey: string;
  leafKey: string;
}): number | undefined => {
  const container = model[containerKey];

  if (typeof container !== 'object' || container === null) {
    return undefined;
  }

  return readPositiveNumber((container as Record<string, unknown>)[leafKey]);
};

const readModels = (payload: unknown): ArtificialAnalysisModel[] => {
  if (Array.isArray(payload)) {
    return payload as ArtificialAnalysisModel[];
  }

  const data = (payload as { data?: unknown } | null)?.data;

  return Array.isArray(data) ? (data as ArtificialAnalysisModel[]) : [];
};

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
): boolean =>
  (candidate.intelligenceIndex ?? -1) !== (existing.intelligenceIndex ?? -1)
    ? (candidate.intelligenceIndex ?? -1) > (existing.intelligenceIndex ?? -1)
    : informationScore(candidate) > informationScore(existing);

export const fetchArtificialAnalysisBenchmarks = async (
  apiKey: string,
): Promise<BenchmarkIndex> => {
  const url =
    process.env.ARTIFICIAL_ANALYSIS_API_URL ??
    DEFAULT_ARTIFICIAL_ANALYSIS_API_URL;

  const response = await fetch(url, {
    headers: { 'x-api-key': apiKey },
    signal: AbortSignal.timeout(60000),
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const models = readModels(await response.json());

  if (models.length === 0) {
    throw new Error(`No models in response from ${url}`);
  }

  const index: BenchmarkIndex = new Map();

  for (const model of models) {
    // One malformed row must not cost us every measurement in the response.
    if (typeof model !== 'object' || model === null) {
      continue;
    }

    const aliases = [model.slug, model.id, model.name].filter(isDefined);

    // The intelligence index sits under `evaluations` and cost per task under
    // `cost_per_task`; only the speed figure is top level. Reading them all
    // from the top level yields matched models carrying no usable number.
    const record: BenchmarkRecord = {
      intelligenceIndex: readNested({
        model,
        containerKey: 'evaluations',
        leafKey: 'artificial_analysis_intelligence_index',
      }),
      outputTokensPerSecond: readPositiveNumber(
        model.median_output_tokens_per_second,
      ),
      costPerTask: readNested({
        model,
        containerKey: 'cost_per_task',
        leafKey: 'total_cost',
      }),
      aliases,
    };

    if (informationScore(record) === 0) {
      continue;
    }

    for (const alias of aliases) {
      const key = normalizeModelName(alias);
      const existing = index.get(key);

      if (
        key.length > 0 &&
        (!isDefined(existing) || preferOver(record, existing))
      ) {
        index.set(key, record);
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
