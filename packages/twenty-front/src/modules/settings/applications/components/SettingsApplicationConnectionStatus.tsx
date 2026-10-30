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
    return <Status color="gray" weight="medium">{t`Disconnected`}</Status>;
  }

  return isApplicationConnectionReconnectNeeded(connection) ? (
    <Status color="red" weight="medium">{t`Sync failed`}</Status>
  ) : (
    <Status color="green" weight="medium">{t`Connected`}</Status>
  );
};
