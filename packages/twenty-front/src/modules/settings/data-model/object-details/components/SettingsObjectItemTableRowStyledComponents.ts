import { styled } from '@linaria/react';

import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const SETTINGS_OBJECT_TABLE_COLUMN_WIDTH = '98.7px';

export const StyledObjectTableRow = styled(TableRow)`
  grid-template-columns: 180px ${SETTINGS_OBJECT_TABLE_COLUMN_WIDTH} ${SETTINGS_OBJECT_TABLE_COLUMN_WIDTH} ${SETTINGS_OBJECT_TABLE_COLUMN_WIDTH} 36px;
`;

export const StyledNameTableCell = styled(TableCell)`
  color: ${themeCssVariables.font.color.primary};
  gap: ${themeCssVariables.spacing[2]};
`;

export const StyledActionTableCell = styled(TableCell)`
  justify-content: center;
  padding-right: ${themeCssVariables.spacing[1]};
`;
