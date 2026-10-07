import { type AppPreferencesConnectedAccount } from '@/settings/app-preferences/types/AppPreferencesConnectedAccount';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Status } from 'twenty-ui/primitives/data-display';

type SettingsAppPreferencesApplicationAccountStatusProps = {
  account: Pick<AppPreferencesConnectedAccount, 'archivedAt' | 'authFailedAt'>;
};

export const SettingsAppPreferencesApplicationAccountStatus = ({
  account,
}: SettingsAppPreferencesApplicationAccountStatusProps) => {
  const { t } = useLingui();

  return isDefined(account.archivedAt) ? (
    <Status color="gray">{t`Disconnected`}</Status>
  ) : isDefined(account.authFailedAt) ? (
    <Status color="red">{t`Authentication failed`}</Status>
  ) : (
    <Status color="green">{t`Connected`}</Status>
  );
};
