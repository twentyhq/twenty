import { TableCell } from '@/ui/layout/table/components/TableCell';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import React from 'react';

export const SETTINGS_OBJECT_TABLE_COLUMN_WIDTH = '98.7px';

export const SETTINGS_OBJECT_TABLE_ROW_GRID_TEMPLATE_COLUMNS = `180px ${SETTINGS_OBJECT_TABLE_COLUMN_WIDTH} ${SETTINGS_OBJECT_TABLE_COLUMN_WIDTH} ${SETTINGS_OBJECT_TABLE_COLUMN_WIDTH} 36px`;

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
