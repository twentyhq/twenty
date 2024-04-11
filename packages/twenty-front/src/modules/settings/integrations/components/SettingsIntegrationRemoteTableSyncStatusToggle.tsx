import { useState } from 'react';

import { Toggle } from '@/ui/input/components/Toggle';
import { RemoteTableStatus } from '~/generated-metadata/graphql';

export const SettingsIntegrationRemoteTableSyncStatusToggle = ({
  table,
  onSyncUpdate,
}: {
  table: { id: string; name: string; status: RemoteTableStatus };
  onSyncUpdate: (value: boolean, tableName: string) => Promise<void>;
}) => {
  const [isToggleLoading, setIsToggleLoading] = useState(false);

  const onChange = async (newValue: boolean) => {
    if (isToggleLoading) return;
    setIsToggleLoading(true);
    await onSyncUpdate(newValue, table.name);
    setIsToggleLoading(false);
  };

  return (
    <Toggle
      value={table.status === RemoteTableStatus.Synced}
      disabled={isToggleLoading}
      onChange={onChange}
    />
  );
};
