import { styled } from '@linaria/react';

import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { IconMail } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledNameCell = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledHandle = styled.span`
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type SettingsWorkspaceEmailGroupSourceCellProps = {
  item: MessageChannel;
};

export const SettingsWorkspaceEmailGroupSourceCell = ({
  item,
}: SettingsWorkspaceEmailGroupSourceCellProps) => {
  const sourceHandle = item.connectedAccount?.handle ?? item.handle;

  return (
    <StyledNameCell>
      <IconMail size={16} />
      <StyledHandle>{sourceHandle}</StyledHandle>
    </StyledNameCell>
  );
};
