import { GRANOLA_HISTORY_IMPORT_INTERVAL_MILLISECONDS } from 'src/constants/granola-history.constant';

export const getGranolaNoteImportSchedule = ({
  now,
  nextAvailableAt,
  noteCount,
}: {
  now: number;
  nextAvailableAt?: number;
  noteCount: number;
}) => {
  const startsAt = Math.max(now, nextAvailableAt ?? now);
  const nextNoteAvailableAt =
    startsAt + noteCount * GRANOLA_HISTORY_IMPORT_INTERVAL_MILLISECONDS;

  return {
    noteDelays: Array.from(
      { length: noteCount },
      (_, index) =>
        startsAt - now + index * GRANOLA_HISTORY_IMPORT_INTERVAL_MILLISECONDS,
    ),
    continuationDelay: Math.max(
      GRANOLA_HISTORY_IMPORT_INTERVAL_MILLISECONDS,
      nextNoteAvailableAt - now,
    ),
    nextNoteAvailableAt,
  };
};
