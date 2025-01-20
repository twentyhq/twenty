import { IconComponent, IconGoogle, IconMicrosoft } from 'twenty-ui';

import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAccountsListEmptyStateCard } from '@/settings/accounts/components/SettingsAccountsListEmptyStateCard';
import { SettingsPath } from '@/types/SettingsPath';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsAccountsConnectedAccountsRowRightContainer } from '@/settings/accounts/components/SettingsAccountsConnectedAccountsRowRightContainer';
import { useRecoilValue } from 'recoil';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { isDefined } from '~/utils/isDefined';
import { SettingsListCard } from '../../components/SettingsListCard';

const ProviderIcons: { [k: string]: IconComponent } = {
  google: IconGoogle,
  microsoft: IconMicrosoft,
};

export const SettingsAccountsConnectedAccountsListCard = ({
  accounts,
  loading,
}: {
  accounts: ConnectedAccount[];
  loading?: boolean;
}) => {
  const navigate = useNavigateSettings();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  if (!accounts.length) {
    return <SettingsAccountsListEmptyStateCard />;
  }

  const atLeastOneProviderAvailable =
    isDefined(currentWorkspace) &&
    (currentWorkspace?.isGoogleAuthEnabled ||
      currentWorkspace?.isMicrosoftAuthEnabled);

  return (
    <SettingsListCard
      items={accounts}
      getItemLabel={(account) => account.handle}
      isLoading={loading}
      RowIconFn={(row) => ProviderIcons[row.provider]}
      RowRightComponent={({ item: account }) => (
        <SettingsAccountsConnectedAccountsRowRightContainer account={account} />
      )}
      hasFooter={atLeastOneProviderAvailable}
      footerButtonLabel="Add account"
      onFooterButtonClick={() => navigate(SettingsPath.NewAccount)}
    />
  );
};
