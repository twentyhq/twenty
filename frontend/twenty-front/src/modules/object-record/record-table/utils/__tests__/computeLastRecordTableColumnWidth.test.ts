import { computeLastRecordTableColumnWidth } from '@/object-record/record-table/utils/computeLastRecordTableColumnWidth';

describe('computeLastRecordTableColumnWidth', () => {
  it('returns 0 when the table is narrower than the total content width', () => {
    const recordFields = [{ size: 100 }, { size: 100 }];

    const { lastColumnWidth } = computeLastRecordTableColumnWidth({
      recordFields,
      tableWidth: 200,
      shouldCompactFirstColumn: false,
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
      shouldCompactFirstColumn: false,
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
      shouldCompactFirstColumn: false,
      isDragColumnHidden: true,
      isCheckboxColumnHidden: true,
    });

    expect(lastColumnWidth).toBe(65);
  });

  it('uses the compact first column width when shouldCompactFirstColumn is true', () => {
    const recordFields = [{ size: 100 }, { size: 150 }];

    const { lastColumnWidth: lastColumnWidthWithCompact } =
      computeLastRecordTableColumnWidth({
        recordFields,
        tableWidth: 300,
        shouldCompactFirstColumn: true,
        isDragColumnHidden: false,
        isCheckboxColumnHidden: false,
      });

    const { lastColumnWidth: lastColumnWidthWithoutCompact } =
      computeLastRecordTableColumnWidth({
        recordFields,
        tableWidth: 300,
        shouldCompactFirstColumn: false,
        isDragColumnHidden: false,
        isCheckboxColumnHidden: false,
      });

    expect(lastColumnWidthWithCompact).toBe(37);
    expect(lastColumnWidthWithoutCompact).toBe(0);
  });
});
