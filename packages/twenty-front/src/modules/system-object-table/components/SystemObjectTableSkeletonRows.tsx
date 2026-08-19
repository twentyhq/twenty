import { useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { SystemObjectTableCell } from '@/system-object-table/components/SystemObjectTableCell';
import { SystemObjectTableRow } from '@/system-object-table/components/SystemObjectTableRow';
import { SYSTEM_OBJECT_TABLE_SKELETON_ROW_COUNT } from '@/system-object-table/constants/SystemObjectTableSkeletonRowCount';
import { type SystemObjectTableColumn } from '@/system-object-table/types/SystemObjectTableColumn';

export const SystemObjectTableSkeletonRows = <TItem,>({
  columns,
}: {
  columns: SystemObjectTableColumn<TItem>[];
}) => {
  const { theme } = useContext(ThemeContext);

  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      {Array.from({ length: SYSTEM_OBJECT_TABLE_SKELETON_ROW_COUNT }).map(
        (_, rowIndex) => (
          <SystemObjectTableRow
            key={`system-object-table-skeleton-${rowIndex}`}
          >
            {columns.map((column) => (
              <SystemObjectTableCell
                key={column.key}
                columnWidth={column.width}
                align={column.align}
              >
                <Skeleton
                  width={column.width === undefined ? 120 : 60}
                  height={16}
                />
              </SystemObjectTableCell>
            ))}
          </SystemObjectTableRow>
        ),
      )}
    </SkeletonTheme>
  );
};
