import { describe, expect, it } from 'vitest';

import { getGranolaNoteImportSchedule } from 'src/logic-functions/utils/get-granola-note-import-schedule.util';

describe('getGranolaNoteImportSchedule', () => {
  it('spaces note jobs by four seconds after the existing reservation', () => {
    expect(
      getGranolaNoteImportSchedule({
        now: 1000,
        nextAvailableAt: 11000,
        noteCount: 3,
      }),
    ).toEqual({
      noteDelays: [10000, 14000, 18000],
      continuationDelay: 22000,
      nextNoteAvailableAt: 23000,
    });
  });

  it('starts no earlier than the requested delay', () => {
    expect(
      getGranolaNoteImportSchedule({
        now: 1000,
        nextAvailableAt: 5000,
        noteCount: 1,
        notBeforeDelayMilliseconds: 60000,
      }),
    ).toEqual({
      noteDelays: [60000],
      continuationDelay: 64000,
      nextNoteAvailableAt: 65000,
    });
  });

  it('does not schedule in the past and paces empty pages', () => {
    expect(
      getGranolaNoteImportSchedule({
        now: 1000,
        nextAvailableAt: 10,
        noteCount: 0,
      }),
    ).toEqual({
      noteDelays: [],
      continuationDelay: 4000,
      nextNoteAvailableAt: 1000,
    });
  });
});
