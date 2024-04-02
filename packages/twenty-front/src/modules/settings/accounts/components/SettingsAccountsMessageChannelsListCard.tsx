import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { LightIconButton } from 'tsup.ui.index';
import { IconChevronRight } from 'twenty-ui';

import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { MessageChannel } from '@/accounts/types/MessageChannel';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsAccountsListEmptyStateCard } from '@/settings/accounts/components/SettingsAccountsListEmptyStateCard';
import { SettingsAccountsSynchronizationStatus } from '@/settings/accounts/components/SettingsAccountsSynchronizationStatus';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { IconGmail } from '@/ui/display/icon/components/IconGmail';

const StyledRowRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsAccountsMessageChannelsListCard = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const navigate = useNavigate();

  const { records: accounts, loading: accountsLoading } =
    useFindManyRecords<ConnectedAccount>({
      objectNameSingular: CoreObjectNameSingular.ConnectedAccount,
      filter: {
        accountOwnerId: {
          eq: currentWorkspaceMember?.id,
        },
      },
    });

  const { records: messageChannels, loading: messageChannelsLoading } =
    useFindManyRecords<MessageChannel>({
      objectNameSingular: CoreObjectNameSingular.MessageChannel,
      filter: {
        connectedAccountId: {
          in: accounts.map((account) => account.id),
        },
      },
    });

  const messageChannelsWithSyncedEmails = messageChannels.map(
    (messageChannel) => ({
      ...messageChannel,
      isSynced: true,
    }),
  );

  if (!messageChannelsWithSyncedEmails.length) {
    return <SettingsAccountsListEmptyStateCard />;
  }

  return (
    <SettingsListCard
      items={messageChannelsWithSyncedEmails}
      getItemLabel={(messageChannel) => messageChannel.handle}
      isLoading={accountsLoading || messageChannelsLoading}
      onRowClick={(messageChannel) =>
        navigate(`/settings/accounts/emails/${messageChannel.id}`)
      }
      RowIcon={IconGmail}
      RowRightComponent={({ item: messageChannel }) => (
        <StyledRowRightContainer>
          <SettingsAccountsSynchronizationStatus
            synced={messageChannel.isSynced}
          />
          <LightIconButton Icon={IconChevronRight} accent="tertiary" />
        </StyledRowRightContainer>
      )}
    />
  );
};
