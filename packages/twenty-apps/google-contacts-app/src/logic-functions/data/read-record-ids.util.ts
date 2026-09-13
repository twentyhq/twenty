import { isNonEmptyString } from '@sniptt/guards';

// One export runs as a single sequential job against a per-user Google write
// quota, so the selection is bounded rather than silently truncated.
export const MAX_EXPORTED_CONTACTS = 2_000;

export const readRecordIds = (recordIds: string[] | undefined): string[] =>
  [...new Set(recordIds ?? [])].filter(isNonEmptyString);
