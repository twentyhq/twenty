import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { IconChevronRight } from 'twenty-ui';

import { CalendarChannel } from '@/accounts/types/CalendarChannel';
import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsAccountsListEmptyStateCard } from '@/settings/accounts/components/SettingsAccountsListEmptyStateCard';
import {
  SettingsAccountsSynchronizationStatus,
  SettingsAccountsSynchronizationStatusProps,
} from '@/settings/accounts/components/SettingsAccountsSynchronizationStatus';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { IconGoogleCalendar } from '@/ui/display/icon/components/IconGoogleCalendar';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';

const StyledRowRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsAccountsCalendarChannelsListCard = () => {
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

  const { records: calendarChannels, loading: calendarChannelsLoading } =
    useFindManyRecords<
      CalendarChannel & {
        connectedAccount: ConnectedAccount;
      }
    >({
      objectNameSingular: CoreObjectNameSingular.CalendarChannel,
      skip: !accounts.length,
      filter: {
        connectedAccountId: {
          in: accounts.map((account) => account.id),
        },
      },
    });

  if (!calendarChannels.length) {
    return <SettingsAccountsListEmptyStateCard />;
  }

  const calendarChannelsWithSyncStatus: (CalendarChannel & {
    connectedAccount: ConnectedAccount;
  } & SettingsAccountsSynchronizationStatusProps)[] = calendarChannels.map(
    (calendarChannel) => ({
      ...calendarChannel,
      syncStatus: calendarChannel.connectedAccount?.authFailedAt
        ? 'failed'
        : calendarChannel.isSyncEnabled
          ? 'synced'
          : 'notSynced',
    }),
  );

  return (
    <SettingsListCard
      items={calendarChannelsWithSyncStatus}
      getItemLabel={(calendarChannel) => calendarChannel.handle}
      isLoading={accountsLoading || calendarChannelsLoading}
      onRowClick={(calendarChannel) =>
        navigate(`/settings/accounts/calendars/${calendarChannel.id}`)
      }
      RowIcon={IconGoogleCalendar}
      RowRightComponent={({ item: calendarChannel }) => (
        <StyledRowRightContainer>
          <SettingsAccountsSynchronizationStatus
            syncStatus={calendarChannel.syncStatus}
          />
          <LightIconButton Icon={IconChevronRight} accent="tertiary" />
        </StyledRowRightContainer>
      )}
    />
  );
};
