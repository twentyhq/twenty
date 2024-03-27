import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { LightIconButton } from 'tsup.ui.index';

import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { MessageChannel } from '@/accounts/types/MessageChannel';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsAccountsListCard } from '@/settings/accounts/components/SettingsAccountsListCard';
import { SettingsAccountsSynchronizationStatus } from '@/settings/accounts/components/SettingsAccountsSynchronizationStatus';
import { IconChevronRight } from '@/ui/display/icon';
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

  return (
    <SettingsAccountsListCard
      items={messageChannelsWithSyncedEmails}
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
