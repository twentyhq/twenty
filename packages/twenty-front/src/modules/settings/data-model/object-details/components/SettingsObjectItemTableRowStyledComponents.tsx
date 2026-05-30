import { TableCell } from '@/ui/layout/table/components/TableCell';
import { styled } from '@linaria/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import React from 'react';

// Kept for back-compat with the SETTINGS_OBJECT_TABLE_COLUMN_WIDTH export —
// the grid below no longer references it so the table can stretch across the
// full available content column instead of summing to ~527 px on every page.
export const SETTINGS_OBJECT_TABLE_COLUMN_WIDTH = '98.7px';

// Relative grid: Name takes all remaining space (with a floor); App / Fields /
// Instances get fixed minimums so short text columns don't collapse; trailing
// 36 px holds the chevron / action cell.
export const SETTINGS_OBJECT_TABLE_ROW_GRID_TEMPLATE_COLUMNS = `minmax(180px, 1fr) 140px 80px 100px 36px`;

export const SETTINGS_OBJECT_TABLE_ROW_MOBILE_MIN_WIDTH = '520px';

export const StyledStickyFirstCell = styled.div`
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    background: ${themeCssVariables.background.primary};
    left: 0;
    position: sticky;
    z-index: 1;
  }
`;

export const StyledNameTableCell = (
  props: React.ComponentProps<typeof TableCell>,
) => (
  <TableCell
    color={themeCssVariables.font.color.primary}
    gap={themeCssVariables.spacing[2]}
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
);

export const StyledActionTableCell = (
  props: React.ComponentProps<typeof TableCell>,
) => (
  <TableCell
    align="center"
    padding={`0 ${themeCssVariables.spacing[1]} 0 ${themeCssVariables.spacing[2]}`}
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
);
