import { isRecordTableColumnRendered } from '@/object-record/record-table/virtualization/utils/isRecordTableColumnRendered';

describe('isRecordTableColumnRendered', () => {
  const renderedColumnRange = { startColumnIndex: 3, endColumnIndex: 6 };

  it('always renders the first column', () => {
    expect(
      isRecordTableColumnRendered({
        columnIndex: 0,
        renderedColumnRange,
        columnIndexesRenderedOutsideRange: [],
      }),
    ).toBe(true);
  });

  it('renders columns in the range and the columns kept outside it', () => {
    expect(
      isRecordTableColumnRendered({
        columnIndex: 4,
        renderedColumnRange,
        columnIndexesRenderedOutsideRange: [],
      }),
    ).toBe(true);
    expect(
      isRecordTableColumnRendered({
        columnIndex: 10,
        renderedColumnRange,
        columnIndexesRenderedOutsideRange: [10],
      }),
    ).toBe(true);
  });

  it('does not render other columns', () => {
    expect(
      isRecordTableColumnRendered({
        columnIndex: 2,
        renderedColumnRange,
        columnIndexesRenderedOutsideRange: [10],
      }),
    ).toBe(false);
  });
});
