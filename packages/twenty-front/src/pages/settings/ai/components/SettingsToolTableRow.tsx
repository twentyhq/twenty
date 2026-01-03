import styled from '@emotion/styled';
import { type ReactNode } from 'react';

import { SettingsItemTypeTag } from '@/settings/components/SettingsItemTypeTag';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { IconCode, OverflowingTextWithTooltip } from 'twenty-ui/display';

import { type ServerlessFunction } from '~/generated-metadata/graphql';

type ToolWithApplicationId = ServerlessFunction & {
  applicationId?: string | null;
};

export type SettingsToolTableRowProps = {
  tool: ToolWithApplicationId;
  action?: ReactNode;
  link?: string;
};

export const StyledToolTableRow = styled(TableRow)`
  grid-template-columns: 1fr 100px 36px;
`;

const StyledNameTableCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.primary};
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 0;
  overflow: hidden;
`;

const StyledIconContainer = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
`;

const StyledActionTableCell = styled(TableCell)`
  justify-content: flex-end;
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsToolTableRow = ({
  tool,
  action,
  link,
}: SettingsToolTableRowProps) => {
  return (
    <StyledToolTableRow to={link}>
      <StyledNameTableCell>
        <StyledIconContainer>
          <IconCode size={16} />
        </StyledIconContainer>
        <OverflowingTextWithTooltip text={tool.name} />
      </StyledNameTableCell>
      <TableCell>
        <SettingsItemTypeTag
          item={{ isCustom: true, applicationId: tool.applicationId }}
        />
      </TableCell>
      <StyledActionTableCell>{action}</StyledActionTableCell>
    </StyledToolTableRow>
  );
};
