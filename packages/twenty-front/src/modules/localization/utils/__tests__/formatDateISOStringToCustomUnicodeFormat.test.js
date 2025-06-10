import { formatDateISOStringToCustomUnicodeFormat } from '@/localization/utils/formatDateISOStringToCustomUnicodeFormat';
import { formatInTimeZone } from 'date-fns-tz';
import { enUS } from 'date-fns/locale';

jest.mock('date-fns-tz');

describe('formatDateISOStringToCustomUnicodeFormat', () => {
  const mockDate = '2023-08-15T10:30:00Z';
  const mockTimeZone = 'America/New_York';
  const mockTimeFormat = 'HH:mm';

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should use provided timezone', () => {
    formatInTimeZone.mockReturnValue('06:30');

    const result = formatDateISOStringToCustomUnicodeFormat({
      date: mockDate,
      timeZone: mockTimeZone,
      dateFormat: mockTimeFormat,
      localeCatalog: enUS,
    });

    expect(formatInTimeZone).toHaveBeenCalledWith(
      new Date(mockDate),
      mockTimeZone,
      mockTimeFormat,
      { locale: enUS },
    );
    expect(result).toBe('06:30');
  });

  it('should gracefully handle errors', () => {
    formatInTimeZone.mockImplementation(() => {
      throw new Error();
    });

    const result = formatDateISOStringToCustomUnicodeFormat({
      date: mockDate,
      timeZone: mockTimeZone,
      dateFormat: 'f',
      localeCatalog: enUS,
    });

    expect(formatInTimeZone).toHaveBeenCalledWith(
      new Date(mockDate),
      mockTimeZone,
      'f',
      { locale: enUS },
    );
    expect(result).toBe('Invalid format string');
  });
});
