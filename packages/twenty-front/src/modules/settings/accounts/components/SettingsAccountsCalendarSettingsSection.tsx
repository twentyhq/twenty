import { useRecoilValue } from 'recoil';

import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsAccountsListEmptyStateCard } from '@/settings/accounts/components/SettingsAccountsListEmptyStateCard';
import { SettingsAccountsListSkeletonCard } from '@/settings/accounts/components/SettingsAccountsListSkeletonCard';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Section } from '@/ui/layout/section/components/Section';

export const SettingsAccountsCalendarSettingsSection = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { records: accounts, loading } = useFindManyRecords<ConnectedAccount>({
    objectNameSingular: CoreObjectNameSingular.ConnectedAccount,
    filter: {
      accountOwnerId: {
        eq: currentWorkspaceMember?.id,
      },
    },
  });

  return (
    <Section>
      <H2Title
        title="Calendar settings"
        description="Sync your calendars and set your preferences"
      />

      {loading ? (
        <SettingsAccountsListSkeletonCard />
      ) : !accounts.length ? (
        <SettingsAccountsListEmptyStateCard />
      ) : null}
    </Section>
  );
};
