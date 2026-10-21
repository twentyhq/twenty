import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { isApplicationConnectionReconnectNeeded } from '@/settings/applications/utils/isApplicationConnectionReconnectNeeded';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Status } from 'twenty-ui/primitives/data-display';

type SettingsApplicationConnectionStatusProps = {
  connection: Partial<Pick<ConnectedAccount, 'authFailedAt' | 'archivedAt'>>;
};

export const SettingsApplicationConnectionStatus = ({
  connection,
}: SettingsApplicationConnectionStatusProps) => {
  const { t } = useLingui();

  if (isDefined(connection.archivedAt)) {
    return <Status color="gray">{t`Disconnected`}</Status>;
  }

  return isApplicationConnectionReconnectNeeded(connection) ? (
    <Status color="red">{t`Reconnect needed`}</Status>
  ) : (
    <Status color="green">{t`Connected`}</Status>
  );
};
