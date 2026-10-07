import { getRecordTableResizeHandlePhysicalPosition } from '@/object-record/record-table/utils/getRecordTableResizeHandlePhysicalPosition';

describe('getRecordTableResizeHandlePhysicalPosition', () => {
  it('keeps the handle side in LTR', () => {
    expect(
      getRecordTableResizeHandlePhysicalPosition({
        position: 'left',
        textDirection: 'ltr',
      }),
    ).toBe('left');
    expect(
      getRecordTableResizeHandlePhysicalPosition({
        position: 'right',
        textDirection: 'ltr',
      }),
    ).toBe('right');
  });

  it('mirrors the handle side in RTL, where the previous column is on the right', () => {
    expect(
      getRecordTableResizeHandlePhysicalPosition({
        position: 'left',
        textDirection: 'rtl',
      }),
    ).toBe('right');
    expect(
      getRecordTableResizeHandlePhysicalPosition({
        position: 'right',
        textDirection: 'rtl',
      }),
    ).toBe('left');
  });
});
