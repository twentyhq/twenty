import { computeRecordTableColumnRange } from '@/object-record/record-table/virtualization/utils/computeRecordTableColumnRange';

const visibleRecordFields = Array.from({ length: 10 }, () => ({ size: 100 }));

describe('computeRecordTableColumnRange', () => {
  it('keeps the columns overlapping the visible window', () => {
    expect(
      computeRecordTableColumnRange({
        visibleRecordFields,
        visibleStartPosition: 250,
        visibleEndPosition: 550,
      }),
    ).toEqual({ startColumnIndex: 2, endColumnIndex: 5 });
  });

  it('never starts before the first scrollable column', () => {
    expect(
      computeRecordTableColumnRange({
        visibleRecordFields,
        visibleStartPosition: -500,
        visibleEndPosition: 150,
      }),
    ).toEqual({ startColumnIndex: 1, endColumnIndex: 1 });
  });

  it('keeps the last column when scrolled past the end', () => {
    expect(
      computeRecordTableColumnRange({
        visibleRecordFields,
        visibleStartPosition: 5000,
        visibleEndPosition: 6000,
      }),
    ).toEqual({ startColumnIndex: 9, endColumnIndex: 9 });
  });

  it('returns an empty range when only the first column exists', () => {
    expect(
      computeRecordTableColumnRange({
        visibleRecordFields: [{ size: 100 }],
        visibleStartPosition: 0,
        visibleEndPosition: 1000,
      }),
    ).toEqual({ startColumnIndex: 1, endColumnIndex: 0 });
  });
});
