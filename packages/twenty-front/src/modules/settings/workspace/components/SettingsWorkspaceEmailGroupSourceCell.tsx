import { styled } from '@linaria/react';

import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { IconMail } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledNameCell = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

type SettingsWorkspaceEmailGroupSourceCellProps = {
  item: MessageChannel;
};

export const SettingsWorkspaceEmailGroupSourceCell = ({
  item,
}: SettingsWorkspaceEmailGroupSourceCellProps) => {
  const sourceHandle = item.connectedAccount?.handle;

  return (
    <StyledNameCell>
      <IconMail size={16} />
      <OverflowingTextWithTooltip text={sourceHandle ?? '—'} />
    </StyledNameCell>
  );
};
