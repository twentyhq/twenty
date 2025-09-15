import { DateFormat } from '@/localization/constants/DateFormat';
import { FieldDateDisplayFormat } from '@/object-record/record-field/ui/types/FieldMetadata';
import { enUS } from 'date-fns/locale';
import { subDays } from 'date-fns';
import { formatDateString } from '~/utils/string/formatDateString';

describe('formatDateString', () => {
  const defaultParams = {
    timeZone: 'UTC',
    dateFormat: DateFormat.DAY_FIRST,
  };

  it('should return empty string for null value', () => {
    const result = formatDateString({
      ...defaultParams,
      value: null,
      localeCatalog: enUS,
    });

    expect(result).toBe('');
  });

  it('should return empty string for undefined value', () => {
    const result = formatDateString({
      ...defaultParams,
      value: undefined,
      localeCatalog: enUS,
    });

    expect(result).toBe('');
  });

  it('should format date as relative when displayFormat is set to RELATIVE', () => {
    const mockDate = subDays(new Date(), 2).toISOString();
    const mockRelativeDate = '2 days ago';

    const result = formatDateString({
      ...defaultParams,
      value: mockDate,
      dateFieldSettings: {
        displayFormat: FieldDateDisplayFormat.RELATIVE,
      },
      localeCatalog: enUS,
    });

    expect(result).toBe(mockRelativeDate);
  });

  it('should format date as datetime when displayFormat is set to USER_SETTINGS', () => {
    const mockDate = '2023-01-01T12:00:00Z';
    const mockFormattedDate = '1 Jan, 2023';

    jest.mock('@/localization/utils/formatDateISOStringToDateTime', () => ({
      formatDateISOStringToDateTime: jest
        .fn()
        .mockReturnValue(mockFormattedDate),
    }));

    const result = formatDateString({
      ...defaultParams,
      value: mockDate,
      dateFieldSettings: {
        displayFormat: FieldDateDisplayFormat.USER_SETTINGS,
      },
      localeCatalog: enUS,
    });

    expect(result).toBe(mockFormattedDate);
  });

  it('should format date with custom format when displayFormat is set to CUSTOM', () => {
    const mockDate = '2023-01-01T12:00:00Z';
    const mockFormattedDate = '2023';

    jest.mock(
      '@/localization/utils/formatDateISOStringToCustomUnicodeFormat',
      () => ({
        formatDateISOStringToCustomUnicodeFormat: jest
          .fn()
          .mockReturnValue(mockFormattedDate),
      }),
    );

    const result = formatDateString({
      ...defaultParams,
      value: mockDate,
      dateFieldSettings: {
        displayFormat: FieldDateDisplayFormat.CUSTOM,
        customUnicodeDateFormat: 'yyyy',
      },
      localeCatalog: enUS,
    });

    expect(result).toBe(mockFormattedDate);
  });

  it('should format date as datetime by default when displayFormat is not provided', () => {
    const mockDate = '2023-01-01T12:00:00Z';
    const mockFormattedDate = '1 Jan, 2023';

    jest.mock('@/localization/utils/formatDateISOStringToDateTime', () => ({
      formatDateISOStringToDateTime: jest
        .fn()
        .mockReturnValue(mockFormattedDate),
    }));

    const result = formatDateString({
      ...defaultParams,
      value: mockDate,
      localeCatalog: enUS,
    });

    expect(result).toBe(mockFormattedDate);
  });
});
