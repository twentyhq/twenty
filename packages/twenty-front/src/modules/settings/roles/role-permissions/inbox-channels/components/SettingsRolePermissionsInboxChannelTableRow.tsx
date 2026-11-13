import { styled } from '@linaria/react';
import { Checkbox } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { InboxChannelIcon } from '@/inbox/components/InboxChannelIcon';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { type AgentChatChannel } from '~/generated-metadata/graphql';

const StyledName = styled.span`
  color: ${themeCssVariables.font.color.primary};
`;

type SettingsRolePermissionsInboxChannelTableRowProps = {
  channel: Pick<AgentChatChannel, 'name' | 'icon' | 'color'>;
  isChecked: boolean;
  isEditable: boolean;
  onToggle: () => void;
};

export const SettingsRolePermissionsInboxChannelTableRow = ({
  channel,
  isChecked,
  isEditable,
  onToggle,
}: SettingsRolePermissionsInboxChannelTableRowProps) => (
  <TableRow
    gridAutoColumns="1fr 24px"
    onClick={isEditable ? onToggle : undefined}
    cursor={isEditable ? 'pointer' : 'default'}
  >
    <TableCell gap={themeCssVariables.spacing[2]}>
      <InboxChannelIcon channel={channel} />
      <StyledName>{channel.name}</StyledName>
    </TableCell>
    <TableCell
      align="right"
      padding={`0 ${themeCssVariables.spacing[1]} 0 ${themeCssVariables.spacing[2]}`}
      onClick={(event) => event.stopPropagation()}
    >
      <Checkbox
        aria-label={channel.name}
        checked={isChecked}
        disabled={!isEditable}
        onCheckedChange={onToggle}
      />
    </TableCell>
  </TableRow>
);
