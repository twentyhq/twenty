import { isDefined } from 'twenty-shared/utils';

import { type ModelsDevModel } from 'src/engine/metadata-modules/ai/ai-models/types/models-dev-model.type';

const DATE_SUFFIX = /-\d{4}-?\d{2}-?\d{2}$/;
const ROLLING_SUFFIX = /-(latest|preview|exp)$/;

const fingerprint = (model: ModelsDevModel): string =>
  JSON.stringify([model.cost ?? {}, model.limit ?? {}]);

// Rolling aliases are never benchmarked by name, so resolve the dated release they point at by price and limits
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
    // Name fallback keeps this deterministic when a provider dates neither twin
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
    // Only the resolved release, not the bare name: undated `mistral-large` is the Feb '24 model and once published a stale score as current
    return [...new Set([...candidates, resolved])];
  }

  // No dated release to point at, so whichever release the publisher measured is the best answer
  return [...new Set([...candidates, modelName.replace(ROLLING_SUFFIX, '')])];
};
