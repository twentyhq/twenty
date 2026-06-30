import { useMemo } from 'react';

import { SpreadsheetImportTable } from '@/spreadsheet-import/components/SpreadsheetImportTable';
import { type ImportedRow } from '@/spreadsheet-import/types';

import { generateSelectionColumns } from './SelectColumn';

type SelectHeaderTableProps = {
  importedRows: ImportedRow[];
  selectedRowIndexes: ReadonlySet<number>;
  setSelectedRowIndexes: (rowIndexes: ReadonlySet<number>) => void;
};

export const SelectHeaderTable = ({
  importedRows,
  selectedRowIndexes,
  setSelectedRowIndexes,
}: SelectHeaderTableProps) => {
  const columns = useMemo(
    () => generateSelectionColumns(importedRows),
    [importedRows],
  );

  return (
    <SpreadsheetImportTable
      // Todo: remove usage of react-data-grid
      rowKeyGetter={(row: any) => importedRows.indexOf(row)}
      rows={importedRows}
      columns={columns}
      selectedRows={selectedRowIndexes}
      onSelectedRowsChange={(newSelectedRows) => {
        for (const value of newSelectedRows) {
          const rowIndex = Number(value);
          if (!selectedRowIndexes.has(rowIndex)) {
            setSelectedRowIndexes(new Set([rowIndex]));
            return;
          }
        }
      }}
      onCellClick={(args) => {
        setSelectedRowIndexes(new Set([importedRows.indexOf(args.row)]));
      }}
      headerRowHeight={0}
    />
  );
};
