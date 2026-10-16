import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
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
  gridTemplateColumns?: string;
  gridAutoColumns?: string;
  rowCount?: number;
};

export const SettingsTableRowsSkeletonLoader = ({
  columns,
  gridTemplateColumns,
  gridAutoColumns,
  rowCount = SKELETON_ROW_LABEL_WIDTHS.length,
}: SettingsTableRowsSkeletonLoaderProps) => (
  <StyledRows>
    {Array.from({ length: rowCount }, (_, rowIndex) => (
      <TableRow
        key={rowIndex}
        gridTemplateColumns={gridTemplateColumns}
        gridAutoColumns={gridAutoColumns}
      >
        {columns.map((column, columnIndex) => (
          <TableCell
            key={columnIndex}
            align={column.align}
            gap={themeCssVariables.spacing[2]}
            minWidth="0"
            overflow="hidden"
          >
            {columnIndex === 0 ? (
              <>
                <SkeletonLine width={ICON_SIZE} height={ICON_SIZE} />
                <SkeletonLine
                  width={
                    SKELETON_ROW_LABEL_WIDTHS[
                      rowIndex % SKELETON_ROW_LABEL_WIDTHS.length
                    ]
                  }
                  height={SKELETON_HEIGHT_SIZES.xs}
                />
              </>
            ) : isDefined(column.width) ? (
              <SkeletonLine
                width={column.width}
                height={SKELETON_HEIGHT_SIZES.xs}
              />
            ) : null}
          </TableCell>
        ))}
      </TableRow>
    ))}
  </StyledRows>
);
