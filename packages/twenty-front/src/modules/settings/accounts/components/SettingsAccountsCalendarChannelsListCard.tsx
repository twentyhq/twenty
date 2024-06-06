import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { IconChevronRight, IconGoogleCalendar } from 'twenty-ui';

import { CalendarChannel } from '@/accounts/types/CalendarChannel';
import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsAccountsListEmptyStateCard } from '@/settings/accounts/components/SettingsAccountsListEmptyStateCard';
import {
  SettingsAccountsSynchronizationStatus,
  SettingsAccountsSynchronizationStatusProps,
} from '@/settings/accounts/components/SettingsAccountsSynchronizationStatus';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';

const StyledRowRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsAccountsCalendarChannelsListCard = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const navigate = useNavigate();
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.CalendarChannel,
  });

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
      recordGqlFields: generateDepthOneRecordGqlFields({ objectMetadataItem }),
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
        ? 'FAILED'
        : 'SUCCEEDED',
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
            isSyncEnabled={calendarChannel.isSyncEnabled}
          />
          <LightIconButton Icon={IconChevronRight} accent="tertiary" />
        </StyledRowRightContainer>
      )}
    />
  );
};
