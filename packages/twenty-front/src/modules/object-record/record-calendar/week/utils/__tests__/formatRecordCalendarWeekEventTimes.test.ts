import { formatRecordCalendarWeekEventTimes } from '@/object-record/record-calendar/week/utils/formatRecordCalendarWeekEventTimes';

const timeZone = 'Europe/Paris';
const timeFormat = 'HH:mm';

describe('formatRecordCalendarWeekEventTimes', () => {
  it('formats the start time and configured time range', () => {
    expect(
      formatRecordCalendarWeekEventTimes({
        startDateTime: '2026-07-08T15:59:00Z',
        endDateTime: '2026-07-10T18:59:00Z',
        timeFormat,
        timeZone,
      }),
    ).toEqual({
      startTime: '17:59',
      timeRange: '17:59 - 20:59',
    });
  });

  it.each([
    ['missing', undefined],
    ['null', null],
    ['invalid', 'not-a-date'],
    ['equal to the start', '2026-07-08T15:59:00Z'],
    ['before the start', '2026-07-08T14:59:00Z'],
  ])('uses only the start time when the end is %s', (_label, endDateTime) => {
    expect(
      formatRecordCalendarWeekEventTimes({
        startDateTime: '2026-07-08T15:59:00Z',
        endDateTime,
        timeFormat,
        timeZone,
      }),
    ).toEqual({
      startTime: '17:59',
      timeRange: '17:59',
    });
  });

  it('returns null when the start is unusable', () => {
    expect(
      formatRecordCalendarWeekEventTimes({
        startDateTime: 'not-a-date',
        timeFormat,
        timeZone,
      }),
    ).toBeNull();
  });
});
