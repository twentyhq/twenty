import { DateFormat } from '@/localization/constants/DateFormat';
import { getChatMessageDayLabel } from '@/chat/utils/getChatMessageDayLabel';

describe('getChatMessageDayLabel', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-23T10:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it.each([
    { date: '2026-11-23T08:00:00.000Z', timeZone: 'UTC', expected: 'Today' },
    {
      date: '2026-11-22T23:30:00.000Z',
      timeZone: 'UTC',
      expected: 'Yesterday',
    },
    {
      date: '2026-11-22T23:30:00.000Z',
      timeZone: 'Europe/Paris',
      expected: 'Today',
    },
    {
      date: '2026-11-12T09:00:00.000Z',
      timeZone: 'UTC',
      expected: 'Nov 12, 2026',
    },
  ])(
    'labels $date in $timeZone as $expected',
    ({ date, timeZone, expected }) => {
      expect(
        getChatMessageDayLabel({
          date,
          timeZone,
          dateFormat: DateFormat.MONTH_FIRST,
        }),
      ).toBe(expected);
    },
  );
});
