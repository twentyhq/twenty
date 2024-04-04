import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { IconChevronRight } from 'twenty-ui';

import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { MessageChannel } from '@/accounts/types/MessageChannel';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsAccountsListEmptyStateCard } from '@/settings/accounts/components/SettingsAccountsListEmptyStateCard';
import {
  SettingsAccountsSynchronizationStatus,
  SettingsAccountsSynchronizationStatusProps,
} from '@/settings/accounts/components/SettingsAccountsSynchronizationStatus';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { IconGmail } from '@/ui/display/icon/components/IconGmail';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';

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
    useFindManyRecords<
      MessageChannel & {
        connectedAccount: ConnectedAccount;
      }
    >({
      objectNameSingular: CoreObjectNameSingular.MessageChannel,
      filter: {
        connectedAccountId: {
          in: accounts.map((account) => account.id),
        },
      },
    });

  const messageChannelsWithSyncedEmails: (MessageChannel & {
    connectedAccount: ConnectedAccount;
  } & SettingsAccountsSynchronizationStatusProps)[] = messageChannels.map(
    (messageChannel) => ({
      ...messageChannel,
      syncStatus: messageChannel.connectedAccount?.authFailedAt
        ? 'failed'
        : 'synced',
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
            syncStatus={messageChannel.syncStatus}
          />
          <LightIconButton Icon={IconChevronRight} accent="tertiary" />
        </StyledRowRightContainer>
      )}
    />
  );
};
