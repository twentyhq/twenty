import { getRecordColumnResizeOffset } from '@/object-record/record-index/utils/getRecordColumnResizeOffset';

describe('getRecordColumnResizeOffset', () => {
  it('widens the column when the pointer moves right in LTR', () => {
    expect(
      getRecordColumnResizeOffset({
        pointerDeltaX: 80,
        uiZoom: 1,
        textDirection: 'ltr',
      }),
    ).toBe(80);
  });

  it('widens the column when the pointer moves left in RTL', () => {
    expect(
      getRecordColumnResizeOffset({
        pointerDeltaX: -80,
        uiZoom: 1,
        textDirection: 'rtl',
      }),
    ).toBe(80);
  });

  it('narrows the column when the pointer moves right in RTL', () => {
    expect(
      getRecordColumnResizeOffset({
        pointerDeltaX: 80,
        uiZoom: 1,
        textDirection: 'rtl',
      }),
    ).toBe(-80);
  });

  it('accounts for the UI zoom', () => {
    expect(
      getRecordColumnResizeOffset({
        pointerDeltaX: -80,
        uiZoom: 2,
        textDirection: 'rtl',
      }),
    ).toBe(40);
  });
});
