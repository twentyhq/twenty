import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { SettingsItemTypeTag } from '@/settings/components/SettingsItemTypeTag';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { IconCode, OverflowingTextWithTooltip } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type LogicFunction } from '~/generated-metadata/graphql';

type ToolWithApplicationId = LogicFunction & {
  applicationId?: string | null;
};

export type SettingsToolTableRowProps = {
  tool: ToolWithApplicationId;
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
  tool,
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
        <StyledIconContainer>
          <IconCode size={16} />
        </StyledIconContainer>
        <OverflowingTextWithTooltip text={tool.name} />
      </TableCell>
      <TableCell>
        <SettingsItemTypeTag
          item={{ isCustom: true, applicationId: tool.applicationId }}
        />
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
