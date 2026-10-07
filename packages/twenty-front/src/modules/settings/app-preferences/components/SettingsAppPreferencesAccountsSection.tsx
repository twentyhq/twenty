import { SettingsAccountsConnectedAccountsTable } from '@/settings/accounts/components/SettingsAccountsConnectedAccountsTable';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui/components/layout';

export const SettingsAppPreferencesAccountsSection = () => {
  const { t } = useLingui();
  const { accounts, loading } = useMyConnectedAccounts();

  return (
    <Section.Root>
      <Section.Header
        title={t`Accounts`}
        description={t`Shared accounts between apps`}
      />
      {loading ? (
        <SettingsSectionSkeletonLoader />
      ) : (
        <SettingsAccountsConnectedAccountsTable accounts={accounts} />
      )}
    </Section.Root>
  );
};
