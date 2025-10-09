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

  const testCases = [
    { granularity: ObjectRecordGroupByDateGranularity.DAY },
    { granularity: ObjectRecordGroupByDateGranularity.MONTH },
    { granularity: ObjectRecordGroupByDateGranularity.QUARTER },
    { granularity: ObjectRecordGroupByDateGranularity.YEAR },
    { granularity: ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK },
    { granularity: ObjectRecordGroupByDateGranularity.MONTH_OF_THE_YEAR },
    { granularity: ObjectRecordGroupByDateGranularity.QUARTER_OF_THE_YEAR },
    { granularity: ObjectRecordGroupByDateGranularity.NONE },
  ];

  it.each(testCases)(
    'should format date for $granularity granularity',
    ({ granularity }) => {
      expect(formatDateByGranularity(testDate, granularity)).toMatchSnapshot();
    },
  );

  describe('quarter calculations', () => {
    const quarterTestCases = [
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
      {
        date: new Date('2024-01-15'),
        granularity: ObjectRecordGroupByDateGranularity.QUARTER_OF_THE_YEAR,
      },
      {
        date: new Date('2024-04-15'),
        granularity: ObjectRecordGroupByDateGranularity.QUARTER_OF_THE_YEAR,
      },
      {
        date: new Date('2024-07-15'),
        granularity: ObjectRecordGroupByDateGranularity.QUARTER_OF_THE_YEAR,
      },
      {
        date: new Date('2024-10-15'),
        granularity: ObjectRecordGroupByDateGranularity.QUARTER_OF_THE_YEAR,
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
