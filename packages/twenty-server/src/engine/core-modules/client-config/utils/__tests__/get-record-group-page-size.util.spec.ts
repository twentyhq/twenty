import { DEFAULT_RECORD_GROUP_PAGE_SIZE } from 'twenty-shared/constants';

import { getRecordGroupPageSize } from 'src/engine/core-modules/client-config/utils/get-record-group-page-size.util';

describe('getRecordGroupPageSize', () => {
  it('should return a positive integer page size as is', () => {
    expect(getRecordGroupPageSize(50)).toBe(50);
  });

  it('should accept the smallest valid page size', () => {
    expect(getRecordGroupPageSize(1)).toBe(1);
  });

  it('should fall back to the default when unset', () => {
    expect(getRecordGroupPageSize(undefined)).toBe(
      DEFAULT_RECORD_GROUP_PAGE_SIZE,
    );
  });

  it('should fall back to the default for zero', () => {
    expect(getRecordGroupPageSize(0)).toBe(DEFAULT_RECORD_GROUP_PAGE_SIZE);
  });

  it('should fall back to the default for a negative value', () => {
    expect(getRecordGroupPageSize(-8)).toBe(DEFAULT_RECORD_GROUP_PAGE_SIZE);
  });

  it('should fall back to the default for a fractional value', () => {
    expect(getRecordGroupPageSize(8.5)).toBe(DEFAULT_RECORD_GROUP_PAGE_SIZE);
  });

  it('should fall back to the default for a NaN value', () => {
    expect(getRecordGroupPageSize(Number.NaN)).toBe(
      DEFAULT_RECORD_GROUP_PAGE_SIZE,
    );
  });

  it('should fall back to the default above the GraphQL Int range', () => {
    expect(getRecordGroupPageSize(2_147_483_648)).toBe(
      DEFAULT_RECORD_GROUP_PAGE_SIZE,
    );
  });
});
