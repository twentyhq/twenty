import { getBookCallAvailability } from '@/getting-started/utils/getBookCallAvailability';

describe('getBookCallAvailability', () => {
  it('should list the days with slots in order and return the first slot', () => {
    expect(
      getBookCallAvailability({
        '2024-03-15': [
          { start: '2024-03-15T08:00:00Z', end: '2024-03-15T08:15:00Z' },
        ],
        '2024-03-14': [],
        '2024-03-13': [
          { start: '2024-03-13T09:00:00Z', end: '2024-03-13T09:15:00Z' },
          { start: '2024-03-13T10:00:00Z', end: '2024-03-13T10:15:00Z' },
        ],
      }),
    ).toEqual({
      availableDayKeys: ['2024-03-13', '2024-03-15'],
      nextSlot: { start: '2024-03-13T09:00:00Z', end: '2024-03-13T09:15:00Z' },
    });
  });

  it('should have no availability before the slots load', () => {
    expect(getBookCallAvailability(null)).toEqual({
      availableDayKeys: [],
      nextSlot: undefined,
    });
  });
});
