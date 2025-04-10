import { formatDateISOStringToCustomUnicodeFormat } from '@/localization/utils/formatDateISOStringToCustomUnicodeFormat';

describe('formatDateISOStringToCustomUnicodeFormat', () => {
  const mockDate = '2023-08-15T10:30:00Z';
  const mockTimeZone = 'America/New_York';
  const mockTimeFormat = 'HH:mm';

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should use provided timezone', () => {
    const result = formatDateISOStringToCustomUnicodeFormat(
      mockDate,
      mockTimeZone,
      mockTimeFormat,
    );

    expect(result).toBe('06:30');
  });

  it('should gracefully handle errors', () => {
    const result = formatDateISOStringToCustomUnicodeFormat(
      mockDate,
      mockTimeZone,
      'f',
    );

    expect(result).toBe('Invalid format string');
  });
});
