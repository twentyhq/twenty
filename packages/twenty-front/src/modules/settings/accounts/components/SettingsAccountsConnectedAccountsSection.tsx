import { useRecoilValue } from 'recoil';

import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Section } from '@/ui/layout/section/components/Section';

import { SettingsAccountsCard } from './SettingsAccountsCard';
import { SettingsAccountsEmptyStateCard } from './SettingsAccountsEmptyStateCard';

export const SettingsAccountsConnectedAccountsSection = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const accounts = useFindManyRecords<ConnectedAccount>({
    objectNameSingular: 'connectedAccount',
    filter: {
      accountOwnerId: {
        eq: currentWorkspaceMember?.id,
      },
    },
  }).records;

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: 'connectedAccount',
  });

  const handleAccountRemove = (idToRemove: string) =>
    deleteOneRecord(idToRemove);

  return (
    <Section>
      <H2Title
        title="Connected accounts"
        description="Manage your internet accounts."
      />
      {accounts?.length ? (
        <SettingsAccountsCard
          accounts={accounts}
          onAccountRemove={handleAccountRemove}
        />
      ) : (
        <SettingsAccountsEmptyStateCard />
      )}
    </Section>
  );
};
