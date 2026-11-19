import { isArray, isObject } from '@sniptt/guards';

import { type TranscriptEntry } from 'src/logic-functions/types/transcript-entry.type';

export const isTranscriptEntryList = (
  value: unknown,
): value is TranscriptEntry[] =>
  isArray(value) &&
  value.every(
    (entry) =>
      isObject(entry) &&
      'participant' in entry &&
      isObject(entry.participant) &&
      'words' in entry &&
      isArray(entry.words),
  );
