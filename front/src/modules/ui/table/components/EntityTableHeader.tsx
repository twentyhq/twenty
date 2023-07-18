import { TableColumn } from '@/people/table/components/peopleColumns';

import { ColumnHead } from './ColumnHead';
import { SelectAllCheckbox } from './SelectAllCheckbox';

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
            <ColumnHead viewName={column.title} viewIcon={column.icon} />
          </th>
        ))}
        <th></th>
      </tr>
    </thead>
  );
}
