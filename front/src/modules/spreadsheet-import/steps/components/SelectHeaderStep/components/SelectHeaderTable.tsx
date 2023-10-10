import { useMemo } from 'react';

import { Table } from '@/spreadsheet-import/components/Table';
import { RawData } from '@/spreadsheet-import/types';

import { generateSelectionColumns } from './SelectColumn';

interface SelectHeaderTableProps {
  data: RawData[];
  selectedRows: ReadonlySet<number>;
  setSelectedRows: (rows: ReadonlySet<number>) => void;
}

export const SelectHeaderTable = ({
  data,
  selectedRows,
  setSelectedRows,
}: SelectHeaderTableProps) => {
  const columns = useMemo(() => generateSelectionColumns(data), [data]);

  return (
    <Table
      rowKeyGetter={(row) => data.indexOf(row)}
      rows={data}
      columns={columns}
      selectedRows={selectedRows}
      onSelectedRowsChange={(newRows) => {
        // allow selecting only one row
        newRows.forEach((value) => {
          if (!selectedRows.has(value as number)) {
            setSelectedRows(new Set([value as number]));
            return;
          }
        });
      }}
      onRowClick={(row) => {
        setSelectedRows(new Set([data.indexOf(row)]));
      }}
      headerRowHeight={0}
    />
  );
};
