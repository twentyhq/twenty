import { useMemo } from 'react';

import { SpreadsheetImportTable } from '@/spreadsheet-import/components/SpreadsheetImportTable';
import { ImportedRow } from '@/spreadsheet-import/types';

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
      selectedRowIndexes={selectedRowIndexes}
      onSelectedRowIndexesChange={(newRowIndexes: number[]) => {
        // allow selecting only one row
        newRowIndexes.forEach((value: any) => {
          if (!selectedRowIndexes.has(value as number)) {
            setSelectedRowIndexes(new Set([value as number]));
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
