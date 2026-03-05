import { themeCssVariables } from 'twenty-ui/theme-constants';

import { TableRow } from '@/ui/layout/table/components/TableRow';

const TABLE_SUB_ROW_STYLE: React.CSSProperties = {
  paddingLeft: themeCssVariables.spacing[4],
};

export const TableSubRow = ({
  isSelected,
  isExpanded,
  isClickable,
  onClick,
  to,
  className,
  style,
  children,
  gridAutoColumns,
  gridTemplateColumns,
  mobileGridAutoColumns,
  height,
  cursor,
  hoverBackgroundColor,
}: React.PropsWithChildren<React.ComponentProps<typeof TableRow>>) => (
  <TableRow
    isSelected={isSelected}
    isExpanded={isExpanded}
    isClickable={isClickable}
    onClick={onClick}
    to={to}
    className={className}
    style={{ ...TABLE_SUB_ROW_STYLE, ...style }}
    gridAutoColumns={gridAutoColumns}
    gridTemplateColumns={gridTemplateColumns}
    mobileGridAutoColumns={mobileGridAutoColumns}
    height={height}
    cursor={cursor}
    hoverBackgroundColor={hoverBackgroundColor}
  >
    {children}
  </TableRow>
);
