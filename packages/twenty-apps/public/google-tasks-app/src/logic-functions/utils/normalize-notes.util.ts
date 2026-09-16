import { isNonEmptyString } from '@sniptt/guards';

// Google omits `notes` when it is empty but echoes back the empty string a push
// sends, so both spellings have to collapse to one or every sync sees a diff.
export const normalizeNotes = (
  notes: string | null | undefined,
): string | null => (isNonEmptyString(notes) ? notes : null);
