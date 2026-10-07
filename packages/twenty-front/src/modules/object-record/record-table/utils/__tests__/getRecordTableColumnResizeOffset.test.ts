import { getRecordTableColumnResizeOffset } from '@/object-record/record-table/utils/getRecordTableColumnResizeOffset';

describe('getRecordTableColumnResizeOffset', () => {
  it('widens the column when the pointer moves right in LTR', () => {
    expect(
      getRecordTableColumnResizeOffset({
        pointerDeltaX: 80,
        uiZoom: 1,
        textDirection: 'ltr',
      }),
    ).toBe(80);
  });

  it('widens the column when the pointer moves left in RTL', () => {
    expect(
      getRecordTableColumnResizeOffset({
        pointerDeltaX: -80,
        uiZoom: 1,
        textDirection: 'rtl',
      }),
    ).toBe(80);
  });

  it('narrows the column when the pointer moves right in RTL', () => {
    expect(
      getRecordTableColumnResizeOffset({
        pointerDeltaX: 80,
        uiZoom: 1,
        textDirection: 'rtl',
      }),
    ).toBe(-80);
  });

  it('accounts for the UI zoom', () => {
    expect(
      getRecordTableColumnResizeOffset({
        pointerDeltaX: -80,
        uiZoom: 2,
        textDirection: 'rtl',
      }),
    ).toBe(40);
  });
});
