import { getDateGranularityPluralLabel } from '@/command-menu/pages/page-layout/utils/getDateGranularityPluralLabel';
import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';

describe('getDateGranularityPluralLabel', () => {
  it('returns "days" for DAY granularity', () => {
    expect(
      getDateGranularityPluralLabel(ObjectRecordGroupByDateGranularity.DAY),
    ).toBe('days');
  });

  it('returns "weeks" for WEEK granularity', () => {
    expect(
      getDateGranularityPluralLabel(ObjectRecordGroupByDateGranularity.WEEK),
    ).toBe('weeks');
  });

  it('returns "months" for MONTH granularity', () => {
    expect(
      getDateGranularityPluralLabel(ObjectRecordGroupByDateGranularity.MONTH),
    ).toBe('months');
  });

  it('returns "quarters" for QUARTER granularity', () => {
    expect(
      getDateGranularityPluralLabel(ObjectRecordGroupByDateGranularity.QUARTER),
    ).toBe('quarters');
  });

  it('returns "years" for YEAR granularity', () => {
    expect(
      getDateGranularityPluralLabel(ObjectRecordGroupByDateGranularity.YEAR),
    ).toBe('years');
  });

  it('returns "days" for DAY_OF_THE_WEEK granularity', () => {
    expect(
      getDateGranularityPluralLabel(
        ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK,
      ),
    ).toBe('days');
  });

  it('returns "months" for MONTH_OF_THE_YEAR granularity', () => {
    expect(
      getDateGranularityPluralLabel(
        ObjectRecordGroupByDateGranularity.MONTH_OF_THE_YEAR,
      ),
    ).toBe('months');
  });

  it('returns "quarters" for QUARTER_OF_THE_YEAR granularity', () => {
    expect(
      getDateGranularityPluralLabel(
        ObjectRecordGroupByDateGranularity.QUARTER_OF_THE_YEAR,
      ),
    ).toBe('quarters');
  });

  it('returns "items" for NONE granularity', () => {
    expect(
      getDateGranularityPluralLabel(ObjectRecordGroupByDateGranularity.NONE),
    ).toBe('items');
  });
});
