import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { formatDateByGranularity } from '../formatDateByGranularity';

describe('formatDateByGranularity', () => {
  const testDate = new Date('2024-03-20T12:00:00Z');

  beforeAll(() => {
    // Mock toLocaleDateString to avoid timezone/locale issues
    jest
      .spyOn(Date.prototype, 'toLocaleDateString')
      .mockImplementation((_locales, options) => {
        if (options?.weekday === 'long') return 'Wednesday';
        if (options?.month === 'long' && !isDefined(options?.year))
          return 'March';
        if (options?.month === 'long' && isDefined(options?.year))
          return 'March 2024';
        if (options?.month === 'short') return 'Mar 20, 2024';
        return '3/20/2024';
      });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

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
    'should format date for $granularity granularity',
    ({ granularity }) => {
      expect(formatDateByGranularity(testDate, granularity)).toMatchSnapshot();
    },
  );

  describe('week calculations', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
    });

    afterEach(() => {
      jest
        .spyOn(Date.prototype, 'toLocaleDateString')
        .mockImplementation((_locales, options) => {
          if (options?.weekday === 'long') return 'Wednesday';
          if (options?.month === 'long' && !isDefined(options?.year))
            return 'March';
          if (options?.month === 'long' && isDefined(options?.year))
            return 'March 2024';
          if (options?.month === 'short') return 'Mar 20, 2024';
          return '3/20/2024';
        });
    });

    it('should format week within same month', () => {
      const date = new Date('2024-05-06');
      const result = formatDateByGranularity(
        date,
        ObjectRecordGroupByDateGranularity.WEEK,
      );
      expect(result).toBe('May 6 - 12, 2024');
    });

    it('should format week crossing months', () => {
      const date = new Date('2024-05-27');
      const result = formatDateByGranularity(
        date,
        ObjectRecordGroupByDateGranularity.WEEK,
      );
      expect(result).toBe('May 27 - Jun 2, 2024');
    });

    it('should format week crossing years', () => {
      const date = new Date('2024-12-30');
      const result = formatDateByGranularity(
        date,
        ObjectRecordGroupByDateGranularity.WEEK,
      );
      expect(result).toBe('Dec 30, 2024 - Jan 5, 2025');
    });
  });

  describe('quarter calculations', () => {
    const quarterTestCases: {
      date: Date;
      granularity: ObjectRecordGroupByDateGranularity.QUARTER;
    }[] = [
      {
        date: new Date('2024-01-15'),
        granularity: ObjectRecordGroupByDateGranularity.QUARTER,
      },
      {
        date: new Date('2024-04-15'),
        granularity: ObjectRecordGroupByDateGranularity.QUARTER,
      },
      {
        date: new Date('2024-07-15'),
        granularity: ObjectRecordGroupByDateGranularity.QUARTER,
      },
      {
        date: new Date('2024-10-15'),
        granularity: ObjectRecordGroupByDateGranularity.QUARTER,
      },
    ];

    it.each(quarterTestCases)(
      'should calculate quarter for $granularity with date $date',
      ({ date, granularity }) => {
        expect(formatDateByGranularity(date, granularity)).toMatchSnapshot();
      },
    );
  });
});
