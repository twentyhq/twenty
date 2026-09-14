import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { SettingsTableFirstColumn } from '@/settings/components/SettingsTableFirstColumn';

type SettingsWorkspaceEmailGroupSourceCellProps = {
  item: MessageChannel;
};

export const SettingsWorkspaceEmailGroupSourceCell = ({
  item,
}: SettingsWorkspaceEmailGroupSourceCellProps) => {
  const sourceHandle = item.connectedAccount?.handle;

  return <SettingsTableFirstColumn label={sourceHandle ?? '—'} />;
};
