import { useRecoilValue } from 'recoil';

import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsAccountsSkeletonCard } from '@/settings/accounts/components/SettingsAccountsSkeletonCard';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Section } from '@/ui/layout/section/components/Section';

import { SettingsAccountsEmptyStateCard } from './SettingsAccountsEmptyStateCard';

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
        <SettingsAccountsSkeletonCard />
      ) : !accounts.length ? (
        <SettingsAccountsEmptyStateCard />
      ) : null}
    </Section>
  );
};
