import { styled } from '@linaria/react';

import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledNameCell = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
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
      <OverflowingTextWithTooltip text={sourceHandle ?? '—'} />
    </StyledNameCell>
  );
};
