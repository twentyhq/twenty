import { styled } from '@linaria/react';
import { useState, type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { SystemObjectTableCell } from '@/system-object-table/components/SystemObjectTableCell';
import { SystemObjectTableHeaderCell } from '@/system-object-table/components/SystemObjectTableHeaderCell';
import { SystemObjectTableRow } from '@/system-object-table/components/SystemObjectTableRow';
import { SystemObjectTableSkeletonRows } from '@/system-object-table/components/SystemObjectTableSkeletonRows';
import { type SystemObjectTableColumn } from '@/system-object-table/types/SystemObjectTableColumn';
import { type SystemObjectTableSort } from '@/system-object-table/types/SystemObjectTableSort';
import { getSortedSystemObjectTableItems } from '@/system-object-table/utils/getSortedSystemObjectTableItems';

const StyledTable = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

type SystemObjectTableProps<TItem> = {
  columns: SystemObjectTableColumn<TItem>[];
  items: TItem[];
  getItemKey: (item: TItem) => string;
  onItemClick?: (item: TItem) => void;
  defaultSort?: SystemObjectTableSort;
  isLoading?: boolean;
  emptyState?: ReactNode;
};

export const SystemObjectTable = <TItem,>({
  columns,
  items,
  getItemKey,
  onItemClick,
  defaultSort,
  isLoading = false,
  emptyState,
}: SystemObjectTableProps<TItem>) => {
  const [sort, setSort] = useState<SystemObjectTableSort | null>(
    defaultSort ?? null,
  );

  const handleHeaderCellClick = (column: SystemObjectTableColumn<TItem>) => {
    if (!isDefined(column.getSortValue)) {
      return;
    }

    setSort((previousSort) =>
      previousSort?.columnKey === column.key && previousSort.direction === 'asc'
        ? { columnKey: column.key, direction: 'desc' }
        : { columnKey: column.key, direction: 'asc' },
    );
  };

  const sortedItems = getSortedSystemObjectTableItems({ items, columns, sort });

  const shouldDisplayEmptyState =
    !isLoading && sortedItems.length === 0 && isDefined(emptyState);

  return (
    <StyledTable>
      <SystemObjectTableRow>
        {columns.map((column) => (
          <SystemObjectTableHeaderCell
            key={column.key}
            label={column.label}
            columnWidth={column.width}
            align={column.align}
            sortDirection={
              sort?.columnKey === column.key ? sort.direction : undefined
            }
            onClick={
              isDefined(column.getSortValue)
                ? () => handleHeaderCellClick(column)
                : undefined
            }
          />
        ))}
      </SystemObjectTableRow>

      {isLoading && <SystemObjectTableSkeletonRows columns={columns} />}

      {!isLoading &&
        sortedItems.map((item) => (
          <SystemObjectTableRow
            key={getItemKey(item)}
            onClick={
              isDefined(onItemClick) ? () => onItemClick(item) : undefined
            }
          >
            {columns.map((column) => (
              <SystemObjectTableCell
                key={column.key}
                columnWidth={column.width}
                align={column.align}
              >
                {column.render(item)}
              </SystemObjectTableCell>
            ))}
          </SystemObjectTableRow>
        ))}

      {shouldDisplayEmptyState && emptyState}
    </StyledTable>
  );
};
