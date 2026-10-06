import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { getApplicationAccountStatus } from '@/settings/app-preferences/utils/getApplicationAccountStatus';
import { useLingui } from '@lingui/react/macro';
import { Status } from 'twenty-ui/primitives/data-display';

type SettingsAppPreferencesApplicationAccountStatusProps = {
  account: ConnectedAccount;
};

export const SettingsAppPreferencesApplicationAccountStatus = ({
  account,
}: SettingsAppPreferencesApplicationAccountStatusProps) => {
  const { t } = useLingui();

  switch (getApplicationAccountStatus(account)) {
    case 'DISCONNECTED':
      return <Status color="gray" weight="medium">{t`Disconnected`}</Status>;
    case 'RECONNECT_NEEDED':
      return <Status color="red" weight="medium">{t`Reconnect needed`}</Status>;
    case 'CONNECTED':
      return <Status color="green" weight="medium">{t`Connected`}</Status>;
  }
};
