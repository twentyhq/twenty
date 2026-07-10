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

  it('formats the one-hour fallback when the end is unusable', () => {
    expect(
      formatRecordCalendarWeekEventTimeRange({
        startDateTime: '2026-07-08T15:59:00Z',
        endDateTime: 'not-a-date',
        timeFormat,
        timeZone,
      }),
    ).toBe('17:59 - 18:59');
  });

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
