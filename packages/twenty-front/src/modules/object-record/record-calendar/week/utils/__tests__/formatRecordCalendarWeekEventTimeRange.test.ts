import { formatRecordCalendarWeekEventTimeRange } from '@/object-record/record-calendar/week/utils/formatRecordCalendarWeekEventTimeRange';

const timeZone = 'Europe/Paris';
const timeFormat = 'HH:mm';

describe('formatRecordCalendarWeekEventTimeRange', () => {
  it('formats the configured start and end times like the design', () => {
    expect(
      formatRecordCalendarWeekEventTimeRange({
        startDateTime: '2026-07-08T15:59:00Z',
        endDateTime: '2026-07-10T18:59:00Z',
        timeFormat,
        timeZone,
      }),
    ).toBe('17:59 - 20:59');
  });

  it.each([
    ['missing', undefined],
    ['null', null],
    ['invalid', 'not-a-date'],
    ['equal to the start', '2026-07-08T15:59:00Z'],
    ['before the start', '2026-07-08T14:59:00Z'],
  ])(
    'formats only the start time when the end is %s',
    (_label, endDateTime) => {
      expect(
        formatRecordCalendarWeekEventTimeRange({
          startDateTime: '2026-07-08T15:59:00Z',
          endDateTime,
          timeFormat,
          timeZone,
        }),
      ).toBe('17:59');
    },
  );

  it('returns null when the start is unusable', () => {
    expect(
      formatRecordCalendarWeekEventTimeRange({
        startDateTime: 'not-a-date',
        timeFormat,
        timeZone,
      }),
    ).toBeNull();
  });
});
