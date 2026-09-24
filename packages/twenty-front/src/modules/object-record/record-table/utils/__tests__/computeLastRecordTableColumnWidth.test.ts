import { computeLastRecordTableColumnWidth } from '@/object-record/record-table/utils/computeLastRecordTableColumnWidth';

describe('computeLastRecordTableColumnWidth', () => {
  it('returns 0 when the table is narrower than the total content width', () => {
    const recordFields = [{ size: 100 }, { size: 100 }];

    const { lastColumnWidth } = computeLastRecordTableColumnWidth({
      recordFields,
      tableWidth: 200,
      isDragColumnHidden: false,
      isCheckboxColumnHidden: false,
    });

    expect(lastColumnWidth).toBe(0);
  });

  it('returns the remaining positive width when the table is wider than the total content width', () => {
    const recordFields = [{ size: 100 }, { size: 100 }];

    const { lastColumnWidth } = computeLastRecordTableColumnWidth({
      recordFields,
      tableWidth: 300,
      isDragColumnHidden: false,
      isCheckboxColumnHidden: false,
    });

    expect(lastColumnWidth).toBe(25);
  });

  it('excludes drag-and-drop and checkbox widths from the calculation when both columns are hidden', () => {
    const recordFields = [{ size: 100 }, { size: 100 }];

    const { lastColumnWidth } = computeLastRecordTableColumnWidth({
      recordFields,
      tableWidth: 300,
      isDragColumnHidden: true,
      isCheckboxColumnHidden: true,
    });

    expect(lastColumnWidth).toBe(65);
  });

  it('substitutes the first column width when an override is given', () => {
    const recordFields = [{ size: 100 }, { size: 150 }];

    const { lastColumnWidth: lastColumnWidthWithOverride } =
      computeLastRecordTableColumnWidth({
        recordFields,
        tableWidth: 300,
        firstColumnWidthOverride: 72,
        isDragColumnHidden: false,
        isCheckboxColumnHidden: false,
      });

    const { lastColumnWidth: lastColumnWidthWithoutOverride } =
      computeLastRecordTableColumnWidth({
        recordFields,
        tableWidth: 300,
        isDragColumnHidden: false,
        isCheckboxColumnHidden: false,
      });

    expect(lastColumnWidthWithOverride).toBe(3);
    expect(lastColumnWidthWithoutOverride).toBe(0);
  });
});
