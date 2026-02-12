import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';

import { isTimeRangeDateGranularity } from '@/page-layout/widgets/graph/utils/isTimeRangeDateGranularity';

describe('isTimeRangeDateGranularity', () => {
  it('should return true for WEEK', () => {
    expect(
      isTimeRangeDateGranularity(ObjectRecordGroupByDateGranularity.WEEK),
    ).toBe(true);
  });

  it('should return true for MONTH', () => {
    expect(
      isTimeRangeDateGranularity(ObjectRecordGroupByDateGranularity.MONTH),
    ).toBe(true);
  });

  it('should return true for QUARTER', () => {
    expect(
      isTimeRangeDateGranularity(ObjectRecordGroupByDateGranularity.QUARTER),
    ).toBe(true);
  });

  it('should return true for YEAR', () => {
    expect(
      isTimeRangeDateGranularity(ObjectRecordGroupByDateGranularity.YEAR),
    ).toBe(true);
  });

  it('should return false for DAY', () => {
    expect(
      isTimeRangeDateGranularity(ObjectRecordGroupByDateGranularity.DAY),
    ).toBe(false);
  });

  it('should return false for DAY_OF_THE_WEEK', () => {
    expect(
      isTimeRangeDateGranularity(
        ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK,
      ),
    ).toBe(false);
  });

  it('should return false for MONTH_OF_THE_YEAR', () => {
    expect(
      isTimeRangeDateGranularity(
        ObjectRecordGroupByDateGranularity.MONTH_OF_THE_YEAR,
      ),
    ).toBe(false);
  });

  it('should return false for QUARTER_OF_THE_YEAR', () => {
    expect(
      isTimeRangeDateGranularity(
        ObjectRecordGroupByDateGranularity.QUARTER_OF_THE_YEAR,
      ),
    ).toBe(false);
  });

  it('should return false for NONE', () => {
    expect(
      isTimeRangeDateGranularity(ObjectRecordGroupByDateGranularity.NONE),
    ).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isTimeRangeDateGranularity(undefined)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isTimeRangeDateGranularity(null)).toBe(false);
  });
});
