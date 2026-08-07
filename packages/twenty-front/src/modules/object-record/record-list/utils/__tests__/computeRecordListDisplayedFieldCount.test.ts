import { computeRecordListDisplayedFieldCount } from '@/object-record/record-list/utils/computeRecordListDisplayedFieldCount';

describe('computeRecordListDisplayedFieldCount', () => {
  it('returns zero when only the record label and hidden count fit', () => {
    expect(computeRecordListDisplayedFieldCount(407)).toBe(0);
  });

  it('accounts for row padding when calculating field breakpoints', () => {
    expect(computeRecordListDisplayedFieldCount(408)).toBe(1);
    expect(computeRecordListDisplayedFieldCount(576)).toBe(2);
  });

  it('caps the displayed field count at the visible field limit', () => {
    expect(computeRecordListDisplayedFieldCount(10_000)).toBe(6);
  });
});
