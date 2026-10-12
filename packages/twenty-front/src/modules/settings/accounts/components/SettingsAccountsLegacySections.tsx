import { SettingsAccountsBlocklistSection } from '@/settings/accounts/components/SettingsAccountsBlocklistSection';
import { SettingsAccountsConnectedAccountsListCard } from '@/settings/accounts/components/SettingsAccountsConnectedAccountsListCard';
import { SettingsAccountsSettingsSection } from '@/settings/accounts/components/SettingsAccountsSettingsSection';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui/components/layout';

export const SettingsAccountsLegacySections = () => {
  const { t } = useLingui();
  const { accounts, loading } = useMyConnectedAccounts();

  if (loading) {
    return <SettingsSectionSkeletonLoader />;
  }

  return (
    <>
      <Section.Root>
        <Section.Header
          title={t`Connected accounts`}
          description={t`Manage your internet accounts.`}
        />
        <SettingsAccountsConnectedAccountsListCard accounts={accounts} />
      </Section.Root>
      <SettingsAccountsBlocklistSection />
      <SettingsAccountsSettingsSection />
    </>
  );
};
