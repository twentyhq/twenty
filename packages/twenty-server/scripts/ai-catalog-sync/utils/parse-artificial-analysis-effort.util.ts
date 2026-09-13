import { type AiModelEffort, isAiModelEffort } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

// A row run with reasoning switched off carries no effort word at all.
const NO_REASONING_MARKERS = new Set(['non-reasoning', 'nonreasoning']);

// The publisher spells the configuration only inside the trailing parentheses
// of a display name: `GPT-5.6 Sol (max)`, `Gemini 3.8 Flash (high)`,
// `Claude Opus 5 (Adaptive Reasoning, Max Effort)`. Dates, fallbacks and a
// bare "Reasoning" in the same place name no effort.
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
