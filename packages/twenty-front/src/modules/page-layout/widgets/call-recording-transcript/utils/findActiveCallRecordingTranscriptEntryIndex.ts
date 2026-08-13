import { isUndefined } from '@sniptt/guards';
import { type CallRecordingParsedTranscriptEntry } from 'twenty-shared/types';

export const findActiveCallRecordingTranscriptEntryIndex = ({
  entries,
  currentTimeSeconds,
}: {
  entries: CallRecordingParsedTranscriptEntry[];
  currentTimeSeconds: number;
}): number =>
  entries.findLastIndex((entry, entryIndex) =>
    isTranscriptEntryActive({
      entries,
      entry,
      entryIndex,
      currentTimeSeconds,
    }),
  );

const isTranscriptEntryActive = ({
  entries,
  entry,
  entryIndex,
  currentTimeSeconds,
}: {
  entries: CallRecordingParsedTranscriptEntry[];
  entry: CallRecordingParsedTranscriptEntry;
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

  const nextTranscriptEntryStartSeconds = entries
    .slice(entryIndex + 1)
    .find((nextEntry) => !isUndefined(nextEntry.startSeconds))?.startSeconds;

  return isUndefined(nextTranscriptEntryStartSeconds)
    ? true
    : currentTimeSeconds < nextTranscriptEntryStartSeconds;
};
