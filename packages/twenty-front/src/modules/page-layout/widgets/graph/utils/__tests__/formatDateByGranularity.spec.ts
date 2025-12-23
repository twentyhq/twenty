import { Temporal } from 'temporal-polyfill';
import {
  FirstDayOfTheWeek,
  ObjectRecordGroupByDateGranularity,
} from 'twenty-shared/types';
import { formatDateByGranularity } from '@/page-layout/widgets/graph/utils/formatDateByGranularity';

describe('formatDateByGranularity', () => {
  const testDate = Temporal.PlainDate.from('2024-03-20');
  const userTimezone = 'Europe/Paris';

  const testCases: {
    granularity:
      | ObjectRecordGroupByDateGranularity.DAY
      | ObjectRecordGroupByDateGranularity.WEEK
      | ObjectRecordGroupByDateGranularity.MONTH
      | ObjectRecordGroupByDateGranularity.QUARTER
      | ObjectRecordGroupByDateGranularity.YEAR
      | ObjectRecordGroupByDateGranularity.NONE;
  }[] = [
    { granularity: ObjectRecordGroupByDateGranularity.DAY },
    { granularity: ObjectRecordGroupByDateGranularity.WEEK },
    { granularity: ObjectRecordGroupByDateGranularity.MONTH },
    { granularity: ObjectRecordGroupByDateGranularity.QUARTER },
    { granularity: ObjectRecordGroupByDateGranularity.YEAR },
    { granularity: ObjectRecordGroupByDateGranularity.NONE },
  ];

  it.each(testCases)(
    `should format date for $granularity granularity for ${testDate.toString()}`,
    ({ granularity }) => {
      expect(
        formatDateByGranularity(
          testDate,
          granularity,
          userTimezone,
          FirstDayOfTheWeek.MONDAY,
        ),
      ).toMatchSnapshot();
    },
  );

  describe('week calculations', () => {
    it('should format week within same month', () => {
      const date = Temporal.PlainDate.from('2024-05-06');
      const result = formatDateByGranularity(
        date,
        ObjectRecordGroupByDateGranularity.WEEK,
        userTimezone,
        FirstDayOfTheWeek.MONDAY,
      );
      expect(result).toBe('May 6 - 12, 2024');
    });

    it('should format week crossing months', () => {
      const date = Temporal.PlainDate.from('2024-05-27');
      const result = formatDateByGranularity(
        date,
        ObjectRecordGroupByDateGranularity.WEEK,
        userTimezone,
        FirstDayOfTheWeek.MONDAY,
      );
      expect(result).toBe('May 27 - Jun 2, 2024');
    });

    it('should format week crossing years', () => {
      const date = Temporal.PlainDate.from('2024-12-30');
      const result = formatDateByGranularity(
        date,
        ObjectRecordGroupByDateGranularity.WEEK,
        userTimezone,
        FirstDayOfTheWeek.MONDAY,
      );
      expect(result).toBe('Dec 30, 2024 - Jan 5, 2025');
    });
  });

  describe('quarter calculations', () => {
    const quarterTestCases: {
      dayString: string;
      granularity: ObjectRecordGroupByDateGranularity.QUARTER;
    }[] = [
      {
        dayString: '2024-01-15',
        granularity: ObjectRecordGroupByDateGranularity.QUARTER,
      },
      {
        dayString: '2024-02-15',
        granularity: ObjectRecordGroupByDateGranularity.QUARTER,
      },
      {
        dayString: '2024-03-15',
        granularity: ObjectRecordGroupByDateGranularity.QUARTER,
      },
      {
        dayString: '2024-04-15',
        granularity: ObjectRecordGroupByDateGranularity.QUARTER,
      },
      {
        dayString: '2024-05-15',
        granularity: ObjectRecordGroupByDateGranularity.QUARTER,
      },
      {
        dayString: '2024-06-15',
        granularity: ObjectRecordGroupByDateGranularity.QUARTER,
      },
      {
        dayString: '2024-07-15',
        granularity: ObjectRecordGroupByDateGranularity.QUARTER,
      },
      {
        dayString: '2024-08-15',
        granularity: ObjectRecordGroupByDateGranularity.QUARTER,
      },
      {
        dayString: '2024-09-15',
        granularity: ObjectRecordGroupByDateGranularity.QUARTER,
      },
      {
        dayString: '2024-10-15',
        granularity: ObjectRecordGroupByDateGranularity.QUARTER,
      },
      {
        dayString: '2024-11-15',
        granularity: ObjectRecordGroupByDateGranularity.QUARTER,
      },
      {
        dayString: '2024-12-15',
        granularity: ObjectRecordGroupByDateGranularity.QUARTER,
      },
    ];

    it.each(quarterTestCases)(
      'should calculate quarter for $dayString',
      ({ dayString, granularity }) => {
        expect(
          formatDateByGranularity(
            Temporal.PlainDate.from(dayString),
            granularity,
            'Europe/Paris',
            FirstDayOfTheWeek.MONDAY,
          ),
        ).toMatchSnapshot();
      },
    );
  });
});
