import { isDefined } from 'twenty-shared/utils';

import { normalizeModelName } from './normalize-model-name.util';
import { type BenchmarkIndex, type BenchmarkRecord } from './types';

const DEFAULT_ARTIFICIAL_ANALYSIS_API_URL =
  'https://artificialanalysis.ai/api/v2/data/llms/models';

type ArtificialAnalysisModel = Record<string, unknown> & {
  id?: string;
  slug?: string;
  name?: string;
};

const readNumber = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;

const readNestedNumber = (
  model: ArtificialAnalysisModel,
  containerKey: string,
  leafKey: string,
): number | undefined => {
  const container = model[containerKey];

  if (typeof container !== 'object' || container === null) {
    return readNumber(model[leafKey]);
  }

  return readNumber((container as Record<string, unknown>)[leafKey]);
};

const readModels = (payload: unknown): ArtificialAnalysisModel[] => {
  if (Array.isArray(payload)) {
    return payload as ArtificialAnalysisModel[];
  }

  const data = (payload as { data?: unknown } | null)?.data;

  return Array.isArray(data) ? (data as ArtificialAnalysisModel[]) : [];
};

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
    const aliases = [model.slug, model.id, model.name].filter(isDefined);

    const record: BenchmarkRecord = {
      intelligenceIndex: readNestedNumber(
        model,
        'evaluations',
        'artificial_analysis_intelligence_index',
      ),
      outputTokensPerSecond: readNumber(model.median_output_tokens_per_second),
      timeToFirstTokenSeconds: readNumber(
        model.median_time_to_first_token_seconds,
      ),
      costPerTask: readNestedNumber(model, 'cost_per_task', 'total_cost'),
      aliases,
    };

    for (const alias of aliases) {
      const key = normalizeModelName(alias);

      if (key.length > 0 && !index.has(key)) {
        index.set(key, record);
      }
    }
  }

  return index;
};
