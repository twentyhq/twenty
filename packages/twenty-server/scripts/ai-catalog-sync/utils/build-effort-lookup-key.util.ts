import { type AiModelEffort } from 'twenty-shared/ai';

// A per-effort row is filed beside the bare model key, so the ceiling lookup the
// catalog has always done keeps working while a variant can ask for the figure
// taken at its own effort. `@` survives name normalization, so the two key
// spaces cannot collide.
export const buildEffortLookupKey = (
  normalizedModelName: string,
  effort: AiModelEffort,
): string => `${normalizedModelName}@${effort}`;
