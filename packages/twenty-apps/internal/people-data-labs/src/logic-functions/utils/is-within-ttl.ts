import { isDefined } from 'src/utils/is-defined';

const ENRICHMENT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const isWithinTtl = (
  lastEnrichedAt: string | null | undefined,
  ttlMs: number = ENRICHMENT_TTL_MS,
): boolean => {
  if (!isDefined(lastEnrichedAt)) {
    return false;
  }

  const lastEnrichedAtMs = Date.parse(lastEnrichedAt);
  if (Number.isNaN(lastEnrichedAtMs)) {
    return false;
  }

  return Date.now() - lastEnrichedAtMs < ttlMs;
};
