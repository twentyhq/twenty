import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { RadioGroup } from 'twenty-ui/input';
import { useMemo } from 'react';

import { SpreadsheetImportTable } from '@/spreadsheet-import/components/SpreadsheetImportTable';
import { type ImportedRow } from '@/spreadsheet-import/types';

import { generateSelectionColumns } from './SelectColumn';

const StyledRadioGroup = styled(RadioGroup)`
  display: flex;
  flex: 1;
  min-height: 0;
`;

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
    <StyledRadioGroup
      aria-label={t`Select header row`}
      value={Array.from(selectedRowIndexes)[0]}
      onValueChange={(rowIndex: number) =>
        setSelectedRowIndexes(new Set([rowIndex]))
      }
    >
      <SpreadsheetImportTable
        // Todo: remove usage of react-data-grid
        rowKeyGetter={(row: ImportedRow) => importedRows.indexOf(row)}
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
    </StyledRadioGroup>
  );
};
