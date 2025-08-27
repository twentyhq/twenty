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
      onSelectedRowsChange={(newRowIndexes: number[]) => {
        newRowIndexes.forEach((value) => {
          if (!selectedRowIndexes.has(value)) {
            setSelectedRowIndexes(new Set([value]));
            return;
          }
        });
      }}
      onRowClick={(row: any) => {
        setSelectedRowIndexes(new Set([importedRows.indexOf(row)]));
      }}
      headerRowHeight={0}
    />
  );
};
