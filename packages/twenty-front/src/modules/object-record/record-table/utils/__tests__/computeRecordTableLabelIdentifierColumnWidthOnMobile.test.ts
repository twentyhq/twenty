import { computeRecordTableLabelIdentifierColumnWidthOnMobile } from '@/object-record/record-table/utils/computeRecordTableLabelIdentifierColumnWidthOnMobile';

describe('computeRecordTableLabelIdentifierColumnWidthOnMobile', () => {
  it('returns the collapsed width whatever the table width', () => {
    expect(
      computeRecordTableLabelIdentifierColumnWidthOnMobile({
        tableWidth: 390,
        isCollapsed: true,
      }),
    ).toBe(72);

    expect(
      computeRecordTableLabelIdentifierColumnWidthOnMobile({
        tableWidth: 0,
        isCollapsed: true,
      }),
    ).toBe(72);
  });

  it('takes a share of the table width when expanded', () => {
    expect(
      computeRecordTableLabelIdentifierColumnWidthOnMobile({
        tableWidth: 390,
        isCollapsed: false,
      }),
    ).toBe(176);
  });

  it('clamps the expanded width between the mobile bounds', () => {
    expect(
      computeRecordTableLabelIdentifierColumnWidthOnMobile({
        tableWidth: 800,
        isCollapsed: false,
      }),
    ).toBe(200);

    expect(
      computeRecordTableLabelIdentifierColumnWidthOnMobile({
        tableWidth: 200,
        isCollapsed: false,
      }),
    ).toBe(140);
  });

  it('falls back to the minimum width before the table has been measured', () => {
    expect(
      computeRecordTableLabelIdentifierColumnWidthOnMobile({
        tableWidth: 0,
        isCollapsed: false,
      }),
    ).toBe(140);
  });
});
