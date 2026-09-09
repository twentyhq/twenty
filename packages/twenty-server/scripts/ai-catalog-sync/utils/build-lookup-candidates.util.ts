import { isDefined } from 'twenty-shared/utils';

import { type ModelsDevModel } from 'src/engine/metadata-modules/ai/ai-models/types/models-dev-model.type';

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
  const candidates = [modelName, modelName.replace(DATE_SUFFIX, '')];

  const resolved = resolveRollingAlias(modelName, siblingModels);

  if (isDefined(resolved)) {
    candidates.push(resolved, resolved.replace(DATE_SUFFIX, ''));
  }

  // Last: an undated `mistral-large` row in the index is whichever release the
  // publisher last measured, so it must not win over the release the alias
  // currently resolves to.
  candidates.push(modelName.replace(ROLLING_SUFFIX, ''));

  return [...new Set(candidates)];
};
