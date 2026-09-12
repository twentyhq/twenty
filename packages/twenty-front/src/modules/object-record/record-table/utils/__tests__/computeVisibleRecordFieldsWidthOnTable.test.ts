import { computeVisibleRecordFieldsWidthOnTable } from '@/object-record/record-table/utils/computeVisibleRecordFieldsWidthOnTable';

describe('computeVisibleRecordFieldsWidthOnTable', () => {
  it('sums every field size when no override is given', () => {
    const { visibleRecordFieldsWidth } = computeVisibleRecordFieldsWidthOnTable(
      { visibleRecordFields: [{ size: 100 }, { size: 150 }] },
    );

    expect(visibleRecordFieldsWidth).toBe(250);
  });

  it('replaces the first field size with the override', () => {
    const { visibleRecordFieldsWidth } = computeVisibleRecordFieldsWidthOnTable(
      {
        visibleRecordFields: [{ size: 100 }, { size: 150 }],
        firstColumnWidthOverride: 72,
      },
    );

    expect(visibleRecordFieldsWidth).toBe(222);
  });

  it('ignores the override when there is no visible field to apply it to', () => {
    const { visibleRecordFieldsWidth } = computeVisibleRecordFieldsWidthOnTable(
      { visibleRecordFields: [], firstColumnWidthOverride: 72 },
    );

    expect(visibleRecordFieldsWidth).toBe(0);
  });
});
