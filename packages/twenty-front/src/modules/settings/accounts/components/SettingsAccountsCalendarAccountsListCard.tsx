import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsAccountsListCard } from '@/settings/accounts/components/SettingsAccountsListCard';
import { SettingsAccountsSynchronizationStatus } from '@/settings/accounts/components/SettingsAccountsSynchronizationStatus';
import { IconChevronRight } from '@/ui/display/icon';
import { IconGoogleCalendar } from '@/ui/display/icon/components/IconGoogleCalendar';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { mockedConnectedAccounts } from '~/testing/mock-data/accounts';

const StyledRowRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsAccountsCalendarAccountsListCard = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const navigate = useNavigate();

  const { records: _accounts, loading } = useFindManyRecords<ConnectedAccount>({
    objectNameSingular: CoreObjectNameSingular.ConnectedAccount,
    filter: {
      accountOwnerId: {
        eq: currentWorkspaceMember?.id,
      },
    },
  });

  return (
    <SettingsAccountsListCard
      accounts={mockedConnectedAccounts}
      isLoading={loading}
      onRowClick={(account) =>
        navigate(`/settings/accounts/calendars/${account.id}`)
      }
      RowIcon={IconGoogleCalendar}
      RowRightComponent={({ account: _account }) => (
        <StyledRowRightContainer>
          <SettingsAccountsSynchronizationStatus synced />
          <LightIconButton Icon={IconChevronRight} accent="tertiary" />
        </StyledRowRightContainer>
      )}
    />
  );
};
