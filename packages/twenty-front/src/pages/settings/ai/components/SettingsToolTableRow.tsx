import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export type SettingsToolTableRowProps = {
  leftIcon: ReactNode;
  name: string;
  appLabel: string;
  action?: ReactNode;
  link?: string;
};

export const TOOL_TABLE_ROW_GRID_TEMPLATE_COLUMNS = '1fr 100px 36px';

const StyledIconContainer = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
`;

export const SettingsToolTableRow = ({
  leftIcon,
  name,
  appLabel,
  action,
  link,
}: SettingsToolTableRowProps) => {
  return (
    <TableRow
      gridTemplateColumns={TOOL_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
      to={link}
    >
      <TableCell
        color={themeCssVariables.font.color.primary}
        gap={themeCssVariables.spacing[2]}
        minWidth="0"
        overflow="hidden"
      >
        <StyledIconContainer>{leftIcon}</StyledIconContainer>
        <OverflowingTextWithTooltip text={name} />
      </TableCell>
      <TableCell minWidth="0" overflow="hidden">
        <OverflowingTextWithTooltip text={appLabel} />
      </TableCell>
      <TableCell
        align="right"
        padding={`0 ${themeCssVariables.spacing[2]} 0 0`}
      >
        {action}
      </TableCell>
    </TableRow>
  );
};
