import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';

import { isCyclicalDateGranularity } from '@/page-layout/widgets/graph/utils/isCyclicalDateGranularity';

describe('isCyclicalDateGranularity', () => {
  it('should return true for DAY_OF_THE_WEEK', () => {
    expect(
      isCyclicalDateGranularity(
        ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK,
      ),
    ).toBe(true);
  });

  it('should return true for MONTH_OF_THE_YEAR', () => {
    expect(
      isCyclicalDateGranularity(
        ObjectRecordGroupByDateGranularity.MONTH_OF_THE_YEAR,
      ),
    ).toBe(true);
  });

  it('should return true for QUARTER_OF_THE_YEAR', () => {
    expect(
      isCyclicalDateGranularity(
        ObjectRecordGroupByDateGranularity.QUARTER_OF_THE_YEAR,
      ),
    ).toBe(true);
  });

  it('should return false for DAY', () => {
    expect(
      isCyclicalDateGranularity(ObjectRecordGroupByDateGranularity.DAY),
    ).toBe(false);
  });

  it('should return false for WEEK', () => {
    expect(
      isCyclicalDateGranularity(ObjectRecordGroupByDateGranularity.WEEK),
    ).toBe(false);
  });

  it('should return false for MONTH', () => {
    expect(
      isCyclicalDateGranularity(ObjectRecordGroupByDateGranularity.MONTH),
    ).toBe(false);
  });

  it('should return false for QUARTER', () => {
    expect(
      isCyclicalDateGranularity(ObjectRecordGroupByDateGranularity.QUARTER),
    ).toBe(false);
  });

  it('should return false for YEAR', () => {
    expect(
      isCyclicalDateGranularity(ObjectRecordGroupByDateGranularity.YEAR),
    ).toBe(false);
  });

  it('should return false for NONE', () => {
    expect(
      isCyclicalDateGranularity(ObjectRecordGroupByDateGranularity.NONE),
    ).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isCyclicalDateGranularity(undefined)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isCyclicalDateGranularity(null)).toBe(false);
  });
});
