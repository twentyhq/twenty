import { CellContext } from '@tanstack/react-table';

import { CheckboxCell } from '@/ui/components/table/CheckboxCell';
import { SelectAllCheckbox } from '@/ui/components/table/SelectAllCheckbox';

export function getCheckBoxColumn() {
  return {
    id: 'select',
    header: ({ table }: any) => (
      <SelectAllCheckbox
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={(newValue) => table.toggleAllRowsSelected(newValue)}
      />
    ),
    cell: (props: CellContext<any, string>) => (
      <CheckboxCell
        id={`checkbox-selected-${props.row.original.id}`}
        name={`checkbox-selected-${props.row.original.id}`}
        checked={props.row.getIsSelected()}
        onChange={(newValue) => props.row.toggleSelected(newValue)}
      />
    ),
    size: 32,
    maxSize: 32,
  };
}
