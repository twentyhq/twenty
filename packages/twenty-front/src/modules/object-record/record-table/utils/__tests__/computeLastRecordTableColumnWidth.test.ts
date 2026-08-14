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
      uiScale: 1,
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
      uiScale: 1,
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
      uiScale: 1,
    });

    expect(lastColumnWidth).toBe(65);
  });

  it('scales gutters and field sizes but not the cell borders', () => {
    const recordFields = [{ size: 100 }, { size: 100 }];

    // at 1.25: drag 15 + checkbox 35 + add-column 40 = 90 of gutters,
    // fields render at 250, and the 3px of borders stay unscaled
    const { lastColumnWidth } = computeLastRecordTableColumnWidth({
      recordFields,
      tableWidth: 400,
      shouldCompactFirstColumn: false,
      isDragColumnHidden: false,
      isCheckboxColumnHidden: false,
      uiScale: 1.25,
    });

    expect(lastColumnWidth).toBe(400 - 90 - 250 - 3);
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
        uiScale: 1,
      });

    const { lastColumnWidth: lastColumnWidthWithoutCompact } =
      computeLastRecordTableColumnWidth({
        recordFields,
        tableWidth: 300,
        shouldCompactFirstColumn: false,
        isDragColumnHidden: false,
        isCheckboxColumnHidden: false,
        uiScale: 1,
      });

    expect(lastColumnWidthWithCompact).toBe(37);
    expect(lastColumnWidthWithoutCompact).toBe(0);
  });
});
