import { getHighlightedDates } from '@/ui/input/components/internal/date/utils/getHighlightedDates';
import { Temporal } from 'temporal-polyfill';

jest.useFakeTimers().setSystemTime(new Date('2024-10-01T00:00:00.000Z'));

const getUTCPlainDateFromISO = (isoStringDate: string) => {
  return Temporal.Instant.from(isoStringDate)
    .toZonedDateTimeISO('UTC')
    .toPlainDate();
};

describe('getHighlightedDates', () => {
  it('should should return one day if range is one day', () => {
    const dateRange = {
      start: getUTCPlainDateFromISO('2024-10-12T00:00:00.000Z'),
      end: getUTCPlainDateFromISO('2024-10-12T00:00:00.000Z'),
    };
    expect(getHighlightedDates(dateRange.start, dateRange.end)).toEqual([
      getUTCPlainDateFromISO('2024-10-12T00:00:00.000Z'),
    ]);
  });

  it('should should return two days if range is 2 days', () => {
    const dateRange = {
      start: getUTCPlainDateFromISO('2024-10-12T00:00:00.000Z'),
      end: getUTCPlainDateFromISO('2024-10-13T00:00:00.000Z'),
    };
    expect(getHighlightedDates(dateRange.start, dateRange.end)).toEqual([
      getUTCPlainDateFromISO('2024-10-12T00:00:00.000Z'),
      getUTCPlainDateFromISO('2024-10-13T00:00:00.000Z'),
    ]);
  });

  it('should should return 10 days if range is 10 days', () => {
    const dateRange = {
      start: getUTCPlainDateFromISO('2024-10-12T00:00:00.000Z'),
      end: getUTCPlainDateFromISO('2024-10-21T00:00:00.000Z'),
    };
    expect(getHighlightedDates(dateRange.start, dateRange.end)).toEqual([
      getUTCPlainDateFromISO('2024-10-12T00:00:00.000Z'),
      getUTCPlainDateFromISO('2024-10-13T00:00:00.000Z'),
      getUTCPlainDateFromISO('2024-10-14T00:00:00.000Z'),
      getUTCPlainDateFromISO('2024-10-15T00:00:00.000Z'),
      getUTCPlainDateFromISO('2024-10-16T00:00:00.000Z'),
      getUTCPlainDateFromISO('2024-10-17T00:00:00.000Z'),
      getUTCPlainDateFromISO('2024-10-18T00:00:00.000Z'),
      getUTCPlainDateFromISO('2024-10-19T00:00:00.000Z'),
      getUTCPlainDateFromISO('2024-10-20T00:00:00.000Z'),
      getUTCPlainDateFromISO('2024-10-21T00:00:00.000Z'),
    ]);
  });

  it('should highlight all days in range even when far from today', () => {
    const dateRange = {
      start: getUTCPlainDateFromISO('2023-10-01T00:00:00.000Z'),
      end: getUTCPlainDateFromISO('2023-10-10T00:00:00.000Z'),
    };
    expect(getHighlightedDates(dateRange.start, dateRange.end)).toEqual([
      getUTCPlainDateFromISO('2023-10-01T00:00:00.000Z'),
      getUTCPlainDateFromISO('2023-10-02T00:00:00.000Z'),
      getUTCPlainDateFromISO('2023-10-03T00:00:00.000Z'),
      getUTCPlainDateFromISO('2023-10-04T00:00:00.000Z'),
      getUTCPlainDateFromISO('2023-10-05T00:00:00.000Z'),
      getUTCPlainDateFromISO('2023-10-06T00:00:00.000Z'),
      getUTCPlainDateFromISO('2023-10-07T00:00:00.000Z'),
      getUTCPlainDateFromISO('2023-10-08T00:00:00.000Z'),
      getUTCPlainDateFromISO('2023-10-09T00:00:00.000Z'),
      getUTCPlainDateFromISO('2023-10-10T00:00:00.000Z'),
    ]);
  });
});
