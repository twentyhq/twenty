import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAccountsListEmptyStateCard } from '@/settings/accounts/components/SettingsAccountsListEmptyStateCard';
import { SettingsPath } from '@/types/SettingsPath';

import { SettingsAccountsConnectedAccountsRowRightContainer } from '@/settings/accounts/components/SettingsAccountsConnectedAccountsRowRightContainer';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconCalendarEvent,
  IconComponent,
  IconGoogle,
  IconMail,
  IconMicrosoft,
  IconSend,
} from 'twenty-ui/display';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { SettingsListCard } from '../../components/SettingsListCard';

const ProviderIcons: { [k: string]: IconComponent } = {
  google: IconGoogle,
  microsoft: IconMicrosoft,
  imap: IconMail,
  smtp: IconSend,
  caldav: IconCalendarEvent,
};

const getItemIcon = (account: ConnectedAccount) => {
  if (isDefined(account.connectionParameters?.IMAP)) {
    return ProviderIcons.imap;
  }
  if (isDefined(account.connectionParameters?.SMTP)) {
    return ProviderIcons.smtp;
  }
  if (isDefined(account.connectionParameters?.CALDAV)) {
    return ProviderIcons.caldav;
  }
  return ProviderIcons[account.provider];
};

export const SettingsAccountsConnectedAccountsListCard = ({
  accounts,
  loading,
}: {
  accounts: ConnectedAccount[];
  loading?: boolean;
}) => {
  const navigate = useNavigateSettings();
  const { t } = useLingui();

  if (!accounts.length) {
    return <SettingsAccountsListEmptyStateCard />;
  }

  return (
    <SettingsListCard
      items={accounts}
      getItemLabel={(account) => account.handle}
      isLoading={loading}
      RowIconFn={(row) => getItemIcon(row)}
      RowRightComponent={({ item: account }) => (
        <SettingsAccountsConnectedAccountsRowRightContainer account={account} />
      )}
      hasFooter={true}
      footerButtonLabel={t`Add account`}
      onFooterButtonClick={() => navigate(SettingsPath.NewAccount)}
    />
  );
};
