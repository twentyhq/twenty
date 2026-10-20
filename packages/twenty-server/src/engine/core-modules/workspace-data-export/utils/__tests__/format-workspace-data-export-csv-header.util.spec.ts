import { formatWorkspaceDataExportCsvHeader } from 'src/engine/core-modules/workspace-data-export/utils/format-workspace-data-export-csv-header.util';

describe('formatWorkspaceDataExportCsvHeader', () => {
  it('writes a BOM-prefixed header with the column names', () => {
    expect(
      formatWorkspaceDataExportCsvHeader([
        { name: 'id', isText: false },
        { name: 'name', isText: true },
        { name: 'emails', isText: false },
      ]),
    ).toBe('\uFEFFid,name,emails\n');
  });

  it('quotes a column name that contains a separator', () => {
    expect(
      formatWorkspaceDataExportCsvHeader([{ name: 'a,b', isText: true }]),
    ).toBe('\uFEFF"a,b"\n');
  });
});
