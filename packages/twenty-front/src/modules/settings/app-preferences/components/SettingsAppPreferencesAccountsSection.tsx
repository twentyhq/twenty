import { SettingsAccountsConnectedAccountsTable } from '@/settings/accounts/components/SettingsAccountsConnectedAccountsTable';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { SettingsAppPreferencesApplicationAccountRow } from '@/settings/app-preferences/components/SettingsAppPreferencesApplicationAccountRow';
import { useMyAppPreferencesApplications } from '@/settings/app-preferences/hooks/useMyAppPreferencesApplications';
import { useMyAppPreferencesConnectedAccounts } from '@/settings/app-preferences/hooks/useMyAppPreferencesConnectedAccounts';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';

export const SettingsAppPreferencesAccountsSection = () => {
  const { t } = useLingui();
  const { accounts, loading } = useMyConnectedAccounts();
  const {
    accounts: appAccounts,
    loading: appAccountsLoading,
    error,
    refetch,
  } = useMyAppPreferencesConnectedAccounts();
  const { applications } = useMyAppPreferencesApplications();
  const applicationsById = new Map(
    applications.map((application) => [application.id, application]),
  );
  const installedAccountRows = appAccounts.flatMap((account) => {
    const application = applicationsById.get(account.applicationId ?? '');
    return isDefined(application)
      ? [
          <SettingsAppPreferencesApplicationAccountRow
            key={account.id}
            account={account}
            application={application}
          />,
        ]
      : [];
  });

  return (
    <Section.Root>
      <Section.Header
        title={t`Accounts`}
        description={t`Shared accounts between apps`}
      />
      {isDefined(error) && (
        <InlineBanner
          variant="compact"
          color="danger"
          message={t`Unable to load app connected accounts.`}
          button={{
            title: t`Retry`,
            onClick: () => Promise.allSettled([refetch()]),
          }}
        />
      )}
      {loading || appAccountsLoading ? (
        <SettingsSectionSkeletonLoader />
      ) : (
        <SettingsAccountsConnectedAccountsTable accounts={accounts}>
          {installedAccountRows.length > 0 ? installedAccountRows : undefined}
        </SettingsAccountsConnectedAccountsTable>
      )}
    </Section.Root>
  );
};
