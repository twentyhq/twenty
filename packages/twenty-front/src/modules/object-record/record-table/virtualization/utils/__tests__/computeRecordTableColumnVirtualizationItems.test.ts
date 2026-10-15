import { computeRecordTableColumnVirtualizationItems } from '@/object-record/record-table/virtualization/utils/computeRecordTableColumnVirtualizationItems';

const visibleRecordFields = [
  { size: 200 },
  { size: 100 },
  { size: 110 },
  { size: 120 },
  { size: 130 },
  { size: 140 },
];

describe('computeRecordTableColumnVirtualizationItems', () => {
  it('replaces the columns around the rendered range with spacers of their summed width', () => {
    expect(
      computeRecordTableColumnVirtualizationItems({
        visibleRecordFields,
        renderedColumnRange: { startColumnIndex: 2, endColumnIndex: 3 },
        columnIndexesRenderedOutsideRange: [],
      }),
    ).toEqual([
      { type: 'spacer', firstColumnIndex: 1, width: 100 },
      { type: 'column', columnIndex: 2 },
      { type: 'column', columnIndex: 3 },
      { type: 'spacer', firstColumnIndex: 4, width: 270 },
    ]);
  });

  it('renders a column kept outside the range in place between spacers', () => {
    expect(
      computeRecordTableColumnVirtualizationItems({
        visibleRecordFields,
        renderedColumnRange: { startColumnIndex: 1, endColumnIndex: 1 },
        columnIndexesRenderedOutsideRange: [4],
      }),
    ).toEqual([
      { type: 'column', columnIndex: 1 },
      { type: 'spacer', firstColumnIndex: 2, width: 230 },
      { type: 'column', columnIndex: 4 },
      { type: 'spacer', firstColumnIndex: 5, width: 140 },
    ]);
  });

  it('clamps a range left over from a wider view', () => {
    expect(
      computeRecordTableColumnVirtualizationItems({
        visibleRecordFields,
        renderedColumnRange: { startColumnIndex: 4, endColumnIndex: 40 },
        columnIndexesRenderedOutsideRange: [40],
      }),
    ).toEqual([
      { type: 'spacer', firstColumnIndex: 1, width: 330 },
      { type: 'column', columnIndex: 4 },
      { type: 'column', columnIndex: 5 },
    ]);
  });

  it('renders a single spacer until the range is measured', () => {
    expect(
      computeRecordTableColumnVirtualizationItems({
        visibleRecordFields,
        renderedColumnRange: null,
        columnIndexesRenderedOutsideRange: [],
      }),
    ).toEqual([{ type: 'spacer', firstColumnIndex: 1, width: 600 }]);
  });
});
