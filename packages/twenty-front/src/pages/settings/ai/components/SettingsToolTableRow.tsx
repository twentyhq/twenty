import { styled } from '@linaria/react';
import { type ComponentType, type ReactNode } from 'react';

import { SettingsItemTypeTag } from '@/settings/components/SettingsItemTypeTag';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export type SettingsToolTableRowProps = {
  LeftIcon: ComponentType<{ size: number }>;
  name: string;
  isCustom?: boolean;
  applicationId?: string | null;
  action?: ReactNode;
  link?: string;
  onClick?: () => void;
  isClickable?: boolean;
};

export const TOOL_TABLE_ROW_GRID_TEMPLATE_COLUMNS = '1fr 100px 36px';

const StyledIconContainer = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
`;

export const SettingsToolTableRow = ({
  LeftIcon,
  name,
  isCustom,
  applicationId,
  action,
  link,
  onClick,
  isClickable,
}: SettingsToolTableRowProps) => {
  return (
    <TableRow
      gridTemplateColumns={TOOL_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
      to={link}
      onClick={onClick}
      isClickable={isClickable}
    >
      <TableCell
        color={themeCssVariables.font.color.primary}
        gap={themeCssVariables.spacing[2]}
        minWidth="0"
        overflow="hidden"
      >
        <StyledIconContainer>
          <LeftIcon size={16} />
        </StyledIconContainer>
        <OverflowingTextWithTooltip text={name} />
      </TableCell>
      <TableCell>
        <SettingsItemTypeTag item={{ isCustom, applicationId }} />
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
