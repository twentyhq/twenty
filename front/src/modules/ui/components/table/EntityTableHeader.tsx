import { TableColumn } from '@/people/table/components/peopleColumns';

export function EntityTableHeader({
  columns,
}: {
  columns: Array<TableColumn>;
}) {
  return (
    <thead>
      <tr>
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
