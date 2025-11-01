import { detectCalendarStartDay } from '@/localization/utils/detection/detectCalendarStartDay';
import { type RelativeDateFilter } from 'twenty-shared/utils';
import { stringifyRelativeDateFilter } from '../stringifyRelativeDateFilter';

jest.mock('@/localization/utils/detection/detectCalendarStartDay');

describe('stringifyRelativeDateFilter', () => {
  const mockDetectCalendarStartDay =
    detectCalendarStartDay as jest.MockedFunction<
      typeof detectCalendarStartDay
    >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDetectCalendarStartDay.mockReturnValue('MONDAY');
  });

  describe('basic stringification', () => {
    it('should stringify a PAST relative date filter', () => {
      const filter: RelativeDateFilter = {
        direction: 'PAST',
        amount: 5,
        unit: 'DAY',
      };

      expect(stringifyRelativeDateFilter(filter)).toBe('PAST_5_DAY');
    });

    it('should stringify a NEXT relative date filter', () => {
      const filter: RelativeDateFilter = {
        direction: 'NEXT',
        amount: 3,
        unit: 'WEEK',
      };

      expect(stringifyRelativeDateFilter(filter)).toBe('NEXT_3_WEEK');
    });

    it('should stringify with different units', () => {
      const dayFilter: RelativeDateFilter = {
        direction: 'PAST',
        amount: 1,
        unit: 'DAY',
      };
      const weekFilter: RelativeDateFilter = {
        direction: 'PAST',
        amount: 1,
        unit: 'WEEK',
      };
      const monthFilter: RelativeDateFilter = {
        direction: 'PAST',
        amount: 1,
        unit: 'MONTH',
      };
      const yearFilter: RelativeDateFilter = {
        direction: 'PAST',
        amount: 1,
        unit: 'YEAR',
      };

      expect(stringifyRelativeDateFilter(dayFilter)).toBe('PAST_1_DAY');
      expect(stringifyRelativeDateFilter(weekFilter)).toBe('PAST_1_WEEK');
      expect(stringifyRelativeDateFilter(monthFilter)).toBe('PAST_1_MONTH');
      expect(stringifyRelativeDateFilter(yearFilter)).toBe('PAST_1_YEAR');
    });
  });

  describe('THIS direction handling', () => {
    it('should stringify THIS direction with amount 1 regardless of provided amount', () => {
      const filter: RelativeDateFilter = {
        direction: 'THIS',
        amount: 5,
        unit: 'WEEK',
      };

      expect(stringifyRelativeDateFilter(filter)).toBe('THIS_1_WEEK');
    });

    it('should stringify THIS direction with amount 1 when amount is undefined', () => {
      const filter: RelativeDateFilter = {
        direction: 'THIS',
        amount: undefined,
        unit: 'MONTH',
      };

      expect(stringifyRelativeDateFilter(filter)).toBe('THIS_1_MONTH');
    });

    it('should stringify THIS direction with amount 1 when amount is null', () => {
      const filter: RelativeDateFilter = {
        direction: 'THIS',
        amount: null,
        unit: 'YEAR',
      };

      expect(stringifyRelativeDateFilter(filter)).toBe('THIS_1_YEAR');
    });
  });

  describe('amount validation', () => {
    it('should throw error when amount is undefined for PAST direction', () => {
      const filter: RelativeDateFilter = {
        direction: 'PAST',
        amount: undefined,
        unit: 'DAY',
      };

      expect(() => stringifyRelativeDateFilter(filter)).toThrow(
        'Amount must be defined and greater than 0 for relative date filters',
      );
    });

    it('should throw error when amount is undefined for NEXT direction', () => {
      const filter: RelativeDateFilter = {
        direction: 'NEXT',
        amount: undefined,
        unit: 'WEEK',
      };

      expect(() => stringifyRelativeDateFilter(filter)).toThrow(
        'Amount must be defined and greater than 0 for relative date filters',
      );
    });

    it('should throw error when amount is null for PAST direction', () => {
      const filter: RelativeDateFilter = {
        direction: 'PAST',
        amount: null,
        unit: 'DAY',
      };

      expect(() => stringifyRelativeDateFilter(filter)).toThrow(
        'Amount must be defined and greater than 0 for relative date filters',
      );
    });

    it('should throw error when amount is 0', () => {
      const filter: RelativeDateFilter = {
        direction: 'PAST',
        amount: 0,
        unit: 'DAY',
      };

      expect(() => stringifyRelativeDateFilter(filter)).toThrow(
        'Amount must be defined and greater than 0 for relative date filters',
      );
    });

    it('should throw error when amount is negative', () => {
      const filter: RelativeDateFilter = {
        direction: 'NEXT',
        amount: -5,
        unit: 'WEEK',
      };

      expect(() => stringifyRelativeDateFilter(filter)).toThrow(
        'Amount must be defined and greater than 0 for relative date filters',
      );
    });
  });

  describe('timezone handling', () => {
    it('should append timezone when provided', () => {
      const filter: RelativeDateFilter = {
        direction: 'PAST',
        amount: 5,
        unit: 'DAY',
        timezone: 'America/New_York',
      };

      expect(stringifyRelativeDateFilter(filter)).toBe(
        'PAST_5_DAY;;America/New_York;;',
      );
    });

    it('should not append timezone when not provided', () => {
      const filter: RelativeDateFilter = {
        direction: 'PAST',
        amount: 5,
        unit: 'DAY',
      };

      expect(stringifyRelativeDateFilter(filter)).toBe('PAST_5_DAY');
    });

    it('should not append timezone when it is an empty string', () => {
      const filter: RelativeDateFilter = {
        direction: 'PAST',
        amount: 5,
        unit: 'DAY',
        timezone: '',
      };

      expect(stringifyRelativeDateFilter(filter)).toBe('PAST_5_DAY');
    });

    it('should not append timezone when it is null', () => {
      const filter: RelativeDateFilter = {
        direction: 'PAST',
        amount: 5,
        unit: 'DAY',
        timezone: null,
      };

      expect(stringifyRelativeDateFilter(filter)).toBe('PAST_5_DAY');
    });
  });

  describe('referenceDayAsString handling', () => {
    it('should append referenceDayAsString when timezone is provided', () => {
      const filter: RelativeDateFilter = {
        direction: 'PAST',
        amount: 5,
        unit: 'DAY',
        timezone: 'America/New_York',
        referenceDayAsString: '2024-01-15',
      };

      expect(stringifyRelativeDateFilter(filter)).toBe(
        'PAST_5_DAY;;America/New_York;;2024-01-15;;MONDAY;;',
      );
    });

    it('should not append referenceDayAsString when timezone is not provided', () => {
      const filter: RelativeDateFilter = {
        direction: 'PAST',
        amount: 5,
        unit: 'DAY',
        referenceDayAsString: '2024-01-15',
      };

      expect(stringifyRelativeDateFilter(filter)).toBe('PAST_5_DAY');
    });

    it('should not append referenceDayAsString when it is empty', () => {
      const filter: RelativeDateFilter = {
        direction: 'PAST',
        amount: 5,
        unit: 'DAY',
        timezone: 'America/New_York',
        referenceDayAsString: '',
      };

      expect(stringifyRelativeDateFilter(filter)).toBe(
        'PAST_5_DAY;;America/New_York;;',
      );
    });

    it('should not append referenceDayAsString when it is null', () => {
      const filter: RelativeDateFilter = {
        direction: 'PAST',
        amount: 5,
        unit: 'DAY',
        timezone: 'America/New_York',
        referenceDayAsString: null,
      };

      expect(stringifyRelativeDateFilter(filter)).toBe(
        'PAST_5_DAY;;America/New_York;;',
      );
    });
  });

  describe('firstDayOfTheWeek handling', () => {
    it('should append firstDayOfTheWeek when timezone and referenceDayAsString are provided', () => {
      const filter: RelativeDateFilter = {
        direction: 'PAST',
        amount: 5,
        unit: 'DAY',
        timezone: 'America/New_York',
        referenceDayAsString: '2024-01-15',
        firstDayOfTheWeek: 'SUNDAY',
      };

      expect(stringifyRelativeDateFilter(filter)).toBe(
        'PAST_5_DAY;;America/New_York;;2024-01-15;;SUNDAY;;',
      );
    });

    it('should use detected calendar start day when firstDayOfTheWeek is not provided', () => {
      mockDetectCalendarStartDay.mockReturnValue('MONDAY');

      const filter: RelativeDateFilter = {
        direction: 'PAST',
        amount: 5,
        unit: 'DAY',
        timezone: 'America/New_York',
        referenceDayAsString: '2024-01-15',
      };

      expect(stringifyRelativeDateFilter(filter)).toBe(
        'PAST_5_DAY;;America/New_York;;2024-01-15;;MONDAY;;',
      );
      expect(mockDetectCalendarStartDay).toHaveBeenCalledTimes(1);
    });

    it('should use detected calendar start day when firstDayOfTheWeek is null', () => {
      mockDetectCalendarStartDay.mockReturnValue('SATURDAY');

      const filter: RelativeDateFilter = {
        direction: 'PAST',
        amount: 5,
        unit: 'DAY',
        timezone: 'America/New_York',
        referenceDayAsString: '2024-01-15',
        firstDayOfTheWeek: null,
      };

      expect(stringifyRelativeDateFilter(filter)).toBe(
        'PAST_5_DAY;;America/New_York;;2024-01-15;;SATURDAY;;',
      );
      expect(mockDetectCalendarStartDay).toHaveBeenCalledTimes(1);
    });

    it('should not append firstDayOfTheWeek when referenceDayAsString is not provided', () => {
      const filter: RelativeDateFilter = {
        direction: 'PAST',
        amount: 5,
        unit: 'DAY',
        timezone: 'America/New_York',
        firstDayOfTheWeek: 'SUNDAY',
      };

      expect(stringifyRelativeDateFilter(filter)).toBe(
        'PAST_5_DAY;;America/New_York;;',
      );
      expect(mockDetectCalendarStartDay).not.toHaveBeenCalled();
    });

    it('should not append firstDayOfTheWeek when timezone is not provided', () => {
      const filter: RelativeDateFilter = {
        direction: 'PAST',
        amount: 5,
        unit: 'DAY',
        referenceDayAsString: '2024-01-15',
        firstDayOfTheWeek: 'SUNDAY',
      };

      expect(stringifyRelativeDateFilter(filter)).toBe('PAST_5_DAY');
      expect(mockDetectCalendarStartDay).not.toHaveBeenCalled();
    });

    it('should not append firstDayOfTheWeek when detected value is empty', () => {
      mockDetectCalendarStartDay.mockReturnValue('' as any);

      const filter: RelativeDateFilter = {
        direction: 'PAST',
        amount: 5,
        unit: 'DAY',
        timezone: 'America/New_York',
        referenceDayAsString: '2024-01-15',
      };

      expect(stringifyRelativeDateFilter(filter)).toBe(
        'PAST_5_DAY;;America/New_York;;2024-01-15;;',
      );
    });
  });

  describe('complex scenarios', () => {
    it('should handle all optional fields together', () => {
      const filter: RelativeDateFilter = {
        direction: 'NEXT',
        amount: 10,
        unit: 'MONTH',
        timezone: 'Europe/London',
        referenceDayAsString: '2024-12-25',
        firstDayOfTheWeek: 'MONDAY',
      };

      expect(stringifyRelativeDateFilter(filter)).toBe(
        'NEXT_10_MONTH;;Europe/London;;2024-12-25;;MONDAY;;',
      );
    });

    it('should handle THIS direction with all optional fields', () => {
      const filter: RelativeDateFilter = {
        direction: 'THIS',
        amount: 7,
        unit: 'WEEK',
        timezone: 'Asia/Tokyo',
        referenceDayAsString: '2024-06-01',
        firstDayOfTheWeek: 'SUNDAY',
      };

      expect(stringifyRelativeDateFilter(filter)).toBe(
        'THIS_1_WEEK;;Asia/Tokyo;;2024-06-01;;SUNDAY;;',
      );
    });

    it('should handle large amount values', () => {
      const filter: RelativeDateFilter = {
        direction: 'PAST',
        amount: 999,
        unit: 'DAY',
      };

      expect(stringifyRelativeDateFilter(filter)).toBe('PAST_999_DAY');
    });
  });
});
