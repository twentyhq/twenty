import { useCallback, useMemo } from 'react';
import { SpreadsheetImportSingleSelectTable } from '@/spreadsheet-import/components/SpreadsheetImportSingleSelectTable';
import { type ImportedRow } from '@/spreadsheet-import/types';
import { useLingui } from '@lingui/react/macro';

type SelectHeaderTableProps = {
  importedRows: ImportedRow[];
  selectedRowIndex: number;
  onSelectedRowChange: (rowIndex: number) => void;
};

export const SelectHeaderTable = ({
  importedRows,
  selectedRowIndex,
  onSelectedRowChange,
}: SelectHeaderTableProps) => {
  const { t } = useLingui();
  const rowKeyGetter = useCallback(
    (row: ImportedRow) => importedRows.indexOf(row),
    [importedRows],
  );

  const columns = useMemo(() => {
    const longestRowLength = importedRows.reduce(
      (length, row) => Math.max(length, row.length),
      0,
    );

    return Array.from({ length: longestRowLength }, (_, index) => ({
      key: index.toString(),
      name: '',
    }));
  }, [importedRows]);

  return (
    <SpreadsheetImportSingleSelectTable
      rowKeyGetter={rowKeyGetter}
      rows={importedRows}
      columns={columns}
      selectionLabel={t`Select header row`}
      selectedRowKey={selectedRowIndex}
      onSelectedRowChange={onSelectedRowChange}
      headerRowHeight={0}
    />
  );
};
