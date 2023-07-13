import { TableColumn } from '@/people/table/components/peopleColumns';

import { SelectAllCheckbox } from './SelectAllCheckboxV2';

export function EntityTableHeader({
  columns,
}: {
  columns: Array<TableColumn>;
}) {
  return (
    <thead>
      <tr>
        <th
          style={{
            width: 30,
            minWidth: 30,
            maxWidth: 30,
          }}
        >
          <SelectAllCheckbox />
        </th>
        {columns.map((column) => (
          <th
            key={column.id.toString()}
            style={{
              width: column.size,
              minWidth: column.size,
              maxWidth: column.size,
            }}
          >
            {column.title}
          </th>
        ))}
        <th></th>
      </tr>
    </thead>
  );
}
