import { getDateFilterDisplayValue } from '../getDateFilterDisplayValue';

describe('getDateFilterDisplayValue', () => {
  beforeAll(() => {
    const mockDate = new Date('2025-06-13T14:30:00Z');

    // Mocking responses for date methods to avoid timezone issues
    jest
      .spyOn(mockDate, 'toLocaleString')
      .mockReturnValue('6/13/2025, 2:30:00 PM');
    jest.spyOn(mockDate, 'toLocaleDateString').mockReturnValue('6/13/2025');

    global.Date = jest.fn(() => mockDate) as any;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should return date and time for DATE_TIME field type', () => {
    const date = new Date('2025-06-13T14:30:00Z');
    const result = getDateFilterDisplayValue(date, 'DATE_TIME');
    expect(result).toEqual({ displayValue: '6/13/2025, 2:30:00 PM' });
  });

  it('should return only date for DATE field type', () => {
    const date = new Date('2025-06-13T14:30:00Z');
    const result = getDateFilterDisplayValue(date, 'DATE');
    expect(result).toEqual({ displayValue: '6/13/2025' });
  });
});
