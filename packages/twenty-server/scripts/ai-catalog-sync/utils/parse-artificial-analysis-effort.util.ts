import { type AiModelEffort, isAiModelEffort } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

// A row run with reasoning switched off carries no effort word at all.
const NO_REASONING_MARKERS = new Set(['non-reasoning', 'nonreasoning']);

// Effort only appears in trailing parentheses, e.g. `(max)`; dates, fallbacks and a bare "Reasoning" there name none
export const parseArtificialAnalysisEffort = (
  displayName: string,
): AiModelEffort | undefined => {
  const configuration = displayName.match(/\(([^()]*)\)\s*$/)?.[1];

  if (!isDefined(configuration)) {
    return undefined;
  }

  const segments = configuration
    .split(',')
    .map((segment) => segment.trim().toLowerCase());

  const effort = segments
    .map((segment) => segment.replace(/\s+effort$/, ''))
    .find(isAiModelEffort);

  if (isDefined(effort)) {
    return effort;
  }

  return segments.some((segment) => NO_REASONING_MARKERS.has(segment))
    ? 'none'
    : undefined;
};
