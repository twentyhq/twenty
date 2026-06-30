import { styled } from '@linaria/react';

import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledForwardingCell = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-family: monospace;
  font-size: ${themeCssVariables.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type SettingsWorkspaceEmailGroupForwardingCellProps = {
  item: MessageChannel;
};

export const SettingsWorkspaceEmailGroupForwardingCell = ({
  item,
}: SettingsWorkspaceEmailGroupForwardingCellProps) => (
  <StyledForwardingCell>{item.handle}</StyledForwardingCell>
);
