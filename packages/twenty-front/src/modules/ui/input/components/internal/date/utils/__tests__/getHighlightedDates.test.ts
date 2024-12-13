import { getHighlightedDates } from '@/ui/input/components/internal/date/utils/getHighlightedDates';

jest.useFakeTimers().setSystemTime(new Date('2024-10-01T00:00:00.000Z'));

describe('getHighlightedDates', () => {
  it('should should return empty if range is undefined', () => {
    const dateRange = undefined;
    expect(getHighlightedDates(dateRange)).toEqual([]);
  });

  it('should should return one day if range is one day', () => {
    const dateRange = {
      start: new Date('2024-10-12T00:00:00.000Z'),
      end: new Date('2024-10-12T00:00:00.000Z'),
    };
    expect(getHighlightedDates(dateRange)).toEqual([
      new Date('2024-10-12T00:00:00.000Z'),
    ]);
  });

  it('should should return two days if range is 2 days', () => {
    const dateRange = {
      start: new Date('2024-10-12T00:00:00.000Z'),
      end: new Date('2024-10-13T00:00:00.000Z'),
    };
    expect(getHighlightedDates(dateRange)).toEqual([
      new Date('2024-10-12T00:00:00.000Z'),
      new Date('2024-10-13T00:00:00.000Z'),
    ]);
  });

  it('should should return 10 days if range is 10 days', () => {
    const dateRange = {
      start: new Date('2024-10-12T00:00:00.000Z'),
      end: new Date('2024-10-21T00:00:00.000Z'),
    };
    expect(getHighlightedDates(dateRange)).toEqual([
      new Date('2024-10-12T00:00:00.000Z'),
      new Date('2024-10-13T00:00:00.000Z'),
      new Date('2024-10-14T00:00:00.000Z'),
      new Date('2024-10-15T00:00:00.000Z'),
      new Date('2024-10-16T00:00:00.000Z'),
      new Date('2024-10-17T00:00:00.000Z'),
      new Date('2024-10-18T00:00:00.000Z'),
      new Date('2024-10-19T00:00:00.000Z'),
      new Date('2024-10-20T00:00:00.000Z'),
      new Date('2024-10-21T00:00:00.000Z'),
    ]);
  });

  it('should should return empty if range is 10 days but out of range', () => {
    const dateRange = {
      start: new Date('2023-10-01T00:00:00.000Z'),
      end: new Date('2023-10-10T00:00:00.000Z'),
    };
    expect(getHighlightedDates(dateRange)).toEqual([]);
  });
});
