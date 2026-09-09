import { isDefined } from 'twenty-shared/utils';

import { type AiModelBenchmarks } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-benchmarks.type';
import { type ModelsDevModel } from 'src/engine/metadata-modules/ai/ai-models/types/models-dev-model.type';

import { normalizeModelName } from './normalize-model-name.util';
import { type BenchmarkIndex, type BenchmarkRecord } from './types';

const DATE_SUFFIX = /-\d{4}-?\d{2}-?\d{2}$/;
const ROLLING_SUFFIX = /-(latest|preview|exp)$/;

const fingerprint = (model: ModelsDevModel): string =>
  JSON.stringify([model.cost ?? {}, model.limit ?? {}]);

// `mistral-large-latest` is never benchmarked under that name, so it is
// resolved to the dated release it currently points at by matching price and
// limits against its non-rolling siblings. Re-resolves on its own when the
// provider repoints the alias.
const resolveRollingAlias = (
  modelName: string,
  siblingModels: Record<string, ModelsDevModel>,
): string | undefined => {
  const model = siblingModels[modelName];

  if (!isDefined(model) || !ROLLING_SUFFIX.test(modelName)) {
    return undefined;
  }

  const target = fingerprint(model);

  const twins = Object.entries(siblingModels)
    .filter(
      ([siblingName, sibling]) =>
        siblingName !== modelName &&
        !ROLLING_SUFFIX.test(siblingName) &&
        fingerprint(sibling) === target,
    )
    .sort(([, a], [, b]) =>
      (b.release_date ?? '').localeCompare(a.release_date ?? ''),
    );

  return twins[0]?.[0];
};

export const buildLookupCandidates = (
  modelName: string,
  siblingModels: Record<string, ModelsDevModel>,
): string[] => {
  const candidates = [
    modelName,
    modelName.replace(DATE_SUFFIX, ''),
    modelName.replace(ROLLING_SUFFIX, ''),
  ];

  const resolved = resolveRollingAlias(modelName, siblingModels);

  if (isDefined(resolved)) {
    candidates.push(resolved, resolved.replace(DATE_SUFFIX, ''));
  }

  return [...new Set(candidates)];
};

const lookup = (
  index: BenchmarkIndex,
  candidates: string[],
): BenchmarkRecord | undefined => {
  for (const candidate of candidates) {
    const record = index.get(normalizeModelName(candidate));

    if (isDefined(record)) {
      return record;
    }
  }

  return undefined;
};

export type MatchBenchmarksArgs = {
  modelName: string;
  siblingModels: Record<string, ModelsDevModel>;
  epochIndex: BenchmarkIndex;
  artificialAnalysisIndex: BenchmarkIndex;
  measuredAt: string;
};

export type BenchmarkMatch = {
  benchmarks: AiModelBenchmarks;
  aliases: string[];
};

export const matchBenchmarks = ({
  modelName,
  siblingModels,
  epochIndex,
  artificialAnalysisIndex,
  measuredAt,
}: MatchBenchmarksArgs): BenchmarkMatch | undefined => {
  const candidates = buildLookupCandidates(modelName, siblingModels);
  const epoch = lookup(epochIndex, candidates);
  const artificialAnalysis = lookup(artificialAnalysisIndex, candidates);

  // Epoch's index aggregates over reasoning effort levels, so it is the
  // headline intelligence number even when both sources have an opinion.
  const intelligenceIndex =
    epoch?.intelligenceIndex ?? artificialAnalysis?.intelligenceIndex;
  const { outputTokensPerSecond, timeToFirstTokenSeconds, costPerTask } =
    artificialAnalysis ?? {};

  const contributedArtificialAnalysis = [
    outputTokensPerSecond,
    timeToFirstTokenSeconds,
    costPerTask,
    artificialAnalysis?.intelligenceIndex,
  ].some(isDefined);

  const sources: AiModelBenchmarks['sources'] = [
    ...(isDefined(epoch?.intelligenceIndex) ? (['epoch-ai'] as const) : []),
    ...(contributedArtificialAnalysis
      ? (['artificial-analysis'] as const)
      : []),
  ];

  // A source that matched but published nothing is not a measurement, so the
  // model keeps no `benchmarks` entry at all rather than an empty one.
  if (sources.length === 0) {
    return undefined;
  }

  return {
    benchmarks: {
      intelligenceIndex,
      outputTokensPerSecond,
      timeToFirstTokenSeconds,
      costPerTask,
      sources,
      measuredAt,
    },
    aliases: [
      ...new Set([
        modelName,
        ...(epoch?.aliases ?? []),
        ...(artificialAnalysis?.aliases ?? []),
      ]),
    ],
  };
};
