import { useState } from 'react';

import { RemoteTableStatus } from '~/generated-metadata/graphql';
import { Toggle } from 'twenty-ui/input';

export const SettingsIntegrationRemoteTableSyncStatusToggle = ({
  tableName,
  tableStatus,
  onSyncUpdate,
}: {
  tableName: string;
  tableStatus: RemoteTableStatus;
  onSyncUpdate: (value: boolean, tableName: string) => Promise<void>;
}) => {
  const [isToggleLoading, setIsToggleLoading] = useState(false);

  const onChange = async (newValue: boolean) => {
    if (isToggleLoading) return;
    setIsToggleLoading(true);
    await onSyncUpdate(newValue, tableName);
    setIsToggleLoading(false);
  };

  return (
    <Toggle
      value={tableStatus === RemoteTableStatus.SYNCED}
      disabled={isToggleLoading}
      onChange={onChange}
    />
  );
};
