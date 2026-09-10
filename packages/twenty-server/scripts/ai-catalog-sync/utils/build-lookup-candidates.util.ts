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
    // Falling back to the name keeps this deterministic when a provider dates
    // neither twin, and for the date-stamped ids providers actually use it
    // still lands on the newer one.
    .sort(
      ([nameA, a], [nameB, b]) =>
        (b.release_date ?? '').localeCompare(a.release_date ?? '') ||
        nameB.localeCompare(nameA),
    );

  return twins[0]?.[0];
};

export const buildLookupCandidates = ({
  modelName,
  siblingModels,
}: {
  modelName: string;
  siblingModels: Record<string, ModelsDevModel>;
}): string[] => {
  const candidates = [modelName, modelName.replace(DATE_SUFFIX, '')];

  const resolved = resolveRollingAlias(modelName, siblingModels);

  if (isDefined(resolved)) {
    // Once the release an alias points at is known, only a row naming that
    // release will do. Every undated spelling is some other release the
    // publisher happens to have measured: `mistral-large` on the leaderboard is
    // the Feb '24 model, and standing in for `mistral-large-2512` it published a
    // two-year-old score as current.
    return [...new Set([...candidates, resolved])];
  }

  // No dated release to point at, so the bare name is the only thing left and
  // whichever release the publisher measured is the best answer available.
  return [...new Set([...candidates, modelName.replace(ROLLING_SUFFIX, '')])];
};
