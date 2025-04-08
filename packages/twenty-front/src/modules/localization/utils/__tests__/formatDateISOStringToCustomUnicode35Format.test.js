import { formatDateISOStringToCustomUnicode35Format } from '@/localization/utils/formatDateISOStringToCustomUnicode35Format';
import { formatInTimeZone } from 'date-fns-tz';
// Mock the imported modules
jest.mock('@/localization/utils/detectDateFormat');
jest.mock('date-fns-tz');

describe('formatDateISOStringToCustomUnicode35Format', () => {
  const mockDate = '2023-08-15T10:30:00Z';
  const mockTimeZone = 'America/New_York';
  const mockTimeFormat = 'HH:mm';

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should use provided timezone', () => {
    formatInTimeZone.mockReturnValue('06:30');

    const result = formatDateISOStringToCustomUnicode35Format(
      mockDate,
      mockTimeZone,
      mockTimeFormat,
    );

    expect(formatInTimeZone).toHaveBeenCalledWith(
      new Date(mockDate),
      mockTimeZone,
      mockTimeFormat
    );
    expect(result).toBe('06:30');
  });
  

  it('should gracefully handle errors', () => {
    formatInTimeZone.mockImplementation(() => {
      throw new Error();
    });

    const result = formatDateISOStringToCustomUnicode35Format(
      mockDate,
      mockTimeZone,
      mockTimeFormat,
    );

    expect(formatInTimeZone).toHaveBeenCalledWith(
      new Date(mockDate),
      mockTimeZone,
      mockTimeFormat
    );
    expect(result).toBe('Invalid format string');
  });
});
