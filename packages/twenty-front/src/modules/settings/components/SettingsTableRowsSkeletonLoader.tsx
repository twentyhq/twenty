import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

const SKELETON_ROW_LABEL_WIDTHS = [144, 104, 128];

const ICON_SIZE = 16;

const StyledRows = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

type SettingsTableRowsSkeletonLoaderColumn = {
  align?: 'left' | 'right';
  width?: number;
};

type SettingsTableRowsSkeletonLoaderProps = {
  columns: SettingsTableRowsSkeletonLoaderColumn[];
  gridTemplateColumns: string;
};

const renderSkeletonCellContent = (
  column: SettingsTableRowsSkeletonLoaderColumn,
  isFirstColumn: boolean,
  labelWidth: number,
): ReactNode => {
  if (isFirstColumn) {
    return (
      <>
        <SkeletonLine width={ICON_SIZE} height={ICON_SIZE} />
        <SkeletonLine width={labelWidth} height={SKELETON_HEIGHT_SIZES.xs} />
      </>
    );
  }

  if (isDefined(column.width)) {
    return (
      <SkeletonLine width={column.width} height={SKELETON_HEIGHT_SIZES.xs} />
    );
  }

  return null;
};

export const SettingsTableRowsSkeletonLoader = ({
  columns,
  gridTemplateColumns,
}: SettingsTableRowsSkeletonLoaderProps) => (
  <StyledRows>
    {SKELETON_ROW_LABEL_WIDTHS.map((labelWidth) => (
      <TableRow key={labelWidth} gridTemplateColumns={gridTemplateColumns}>
        {columns.map((column, columnIndex) => (
          <TableCell
            key={columnIndex}
            align={column.align}
            gap={themeCssVariables.spacing[2]}
            minWidth="0"
            overflow="hidden"
          >
            {renderSkeletonCellContent(column, columnIndex === 0, labelWidth)}
          </TableCell>
        ))}
      </TableRow>
    ))}
  </StyledRows>
);
