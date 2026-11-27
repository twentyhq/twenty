import { css } from '@linaria/core';
import { SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';

import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';

const skeletonLineContainerClassName = css`
  flex: 1;
  min-width: 0;
`;

type TableSkeletonRowsProps = {
  gridTemplateColumns: string;
  columnCount: number;
  rowCount?: number;
};

// columnCount can stay below the grid's column count so trailing icon columns get no bar
export const TableSkeletonRows = ({
  gridTemplateColumns,
  columnCount,
  rowCount = 3,
}: TableSkeletonRowsProps) => (
  <>
    {Array.from({ length: rowCount }, (_, rowIndex) => (
      <TableRow key={rowIndex} gridTemplateColumns={gridTemplateColumns}>
        {Array.from({ length: columnCount }, (_, columnIndex) => (
          <TableCell key={columnIndex}>
            <SkeletonLine
              height={SKELETON_HEIGHT_SIZES.s}
              containerClassName={skeletonLineContainerClassName}
            />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);
