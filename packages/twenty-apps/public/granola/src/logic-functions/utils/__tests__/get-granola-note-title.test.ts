import { describe, expect, it } from 'vitest';

import { buildGranolaNote } from 'src/__tests__/utils/build-granola-note.util';
import { getGranolaNoteTitle } from 'src/logic-functions/utils/get-granola-note-title.util';

describe('getGranolaNoteTitle', () => {
  it.each([
    {
      title: ' Note title ',
      calendarTitle: 'Calendar title',
      expected: 'Note title',
    },
    {
      title: ' ',
      calendarTitle: ' Calendar title ',
      expected: 'Calendar title',
    },
    {
      title: null,
      calendarTitle: 'Calendar title',
      expected: 'Calendar title',
    },
    { title: ' ', calendarTitle: ' ', expected: undefined },
  ])(
    'chooses $expected for note title $title and calendar title $calendarTitle',
    ({ title, calendarTitle, expected }) => {
      expect(
        getGranolaNoteTitle(
          buildGranolaNote({
            title,
            calendar_event: {
              event_title: calendarTitle,
              invitees: [],
              organiser: null,
              calendar_event_id: null,
              scheduled_start_time: null,
              scheduled_end_time: null,
            },
          }),
        ),
      ).toBe(expected);
    },
  );

  it('leaves an untitled note without a calendar event untitled', () => {
    expect(
      getGranolaNoteTitle(buildGranolaNote({ title: null })),
    ).toBeUndefined();
  });
});
