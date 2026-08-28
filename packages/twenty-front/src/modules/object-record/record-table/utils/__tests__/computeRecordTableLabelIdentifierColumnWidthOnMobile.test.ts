import { computeRecordTableLabelIdentifierColumnWidthOnMobile } from '@/object-record/record-table/utils/computeRecordTableLabelIdentifierColumnWidthOnMobile';

describe('computeRecordTableLabelIdentifierColumnWidthOnMobile', () => {
  it('takes a share of the table width', () => {
    expect(computeRecordTableLabelIdentifierColumnWidthOnMobile(390)).toBe(234);
  });

  it('never goes below the width the column would have had on desktop', () => {
    expect(computeRecordTableLabelIdentifierColumnWidthOnMobile(200)).toBe(180);
    expect(computeRecordTableLabelIdentifierColumnWidthOnMobile(360)).toBe(216);
  });

  it('clamps to the maximum on the widest phones', () => {
    expect(computeRecordTableLabelIdentifierColumnWidthOnMobile(800)).toBe(260);
  });

  it('falls back to the minimum before the table has been measured', () => {
    expect(computeRecordTableLabelIdentifierColumnWidthOnMobile(0)).toBe(180);
  });
});
