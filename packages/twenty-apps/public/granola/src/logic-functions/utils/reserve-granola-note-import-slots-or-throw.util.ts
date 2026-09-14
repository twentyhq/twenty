import { kv } from 'twenty-sdk/logic-function';

import { GRANOLA_HISTORY_SCHEDULE_KEY } from 'src/constants/granola.constant';
import { getGranolaNoteImportSchedule } from 'src/logic-functions/utils/get-granola-note-import-schedule.util';

export const reserveGranolaNoteImportSlotsOrThrow = async (
  noteCount: number,
) => {
  const saved = await kv.get<{ nextNoteAvailableAt: number }>(
    GRANOLA_HISTORY_SCHEDULE_KEY,
  );
  const schedule = getGranolaNoteImportSchedule({
    now: Date.now(),
    nextAvailableAt: saved?.nextNoteAvailableAt,
    noteCount,
  });

  if (noteCount > 0) {
    await kv.set(GRANOLA_HISTORY_SCHEDULE_KEY, {
      nextNoteAvailableAt: schedule.nextNoteAvailableAt,
    });
  }

  return schedule;
};
