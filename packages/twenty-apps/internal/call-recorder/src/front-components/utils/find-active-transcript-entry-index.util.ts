import { isUndefined } from '@sniptt/guards';

import { type TranscriptEntry } from 'src/front-components/types/transcript-entry.type';

export const findActiveTranscriptEntryIndex = (
  entries: TranscriptEntry[],
  currentTimeSeconds: number,
): number => {
  for (let entryIndex = entries.length - 1; entryIndex >= 0; entryIndex--) {
    const entry = entries[entryIndex];

    if (
      isTranscriptEntryActive({
        entries,
        entry,
        entryIndex,
        currentTimeSeconds,
      })
    ) {
      return entryIndex;
    }
  }

  return -1;
};

const isTranscriptEntryActive = ({
  entries,
  entry,
  entryIndex,
  currentTimeSeconds,
}: {
  entries: TranscriptEntry[];
  entry: TranscriptEntry;
  entryIndex: number;
  currentTimeSeconds: number;
}): boolean => {
  if (
    isUndefined(entry.startSeconds) ||
    currentTimeSeconds < entry.startSeconds
  ) {
    return false;
  }

  if (!isUndefined(entry.endSeconds)) {
    return currentTimeSeconds <= entry.endSeconds;
  }

  const nextTranscriptEntryStartSeconds = findNextTranscriptEntryStartSeconds(
    entries,
    entryIndex,
  );

  return isUndefined(nextTranscriptEntryStartSeconds)
    ? true
    : currentTimeSeconds < nextTranscriptEntryStartSeconds;
};

const findNextTranscriptEntryStartSeconds = (
  entries: TranscriptEntry[],
  entryIndex: number,
): number | undefined => {
  for (
    let nextEntryIndex = entryIndex + 1;
    nextEntryIndex < entries.length;
    nextEntryIndex++
  ) {
    const nextTranscriptEntryStartSeconds =
      entries[nextEntryIndex].startSeconds;

    if (!isUndefined(nextTranscriptEntryStartSeconds)) {
      return nextTranscriptEntryStartSeconds;
    }
  }

  return undefined;
};
