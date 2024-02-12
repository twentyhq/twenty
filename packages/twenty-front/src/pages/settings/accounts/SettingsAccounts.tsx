import { useRecoilValue } from 'recoil';

import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsAccountsConnectedAccountsSection } from '@/settings/accounts/components/SettingsAccountsConnectedAccountsSection';
import { SettingsAccountsSettingsSection } from '@/settings/accounts/components/SettingsAccountsSettingsSection';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { IconSettings } from '@/ui/display/icon';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { SettingsAccountLoader } from '~/pages/settings/accounts/SettingsAccountLoader';

export const SettingsAccounts = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { records: accounts, loading } = useFindManyRecords<ConnectedAccount>({
    objectNameSingular: 'connectedAccount',
    filter: {
      accountOwnerId: {
        eq: currentWorkspaceMember?.id,
      },
    },
  });

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer
        style={
          loading
            ? { height: '100%', boxSizing: 'border-box', width: '100%' }
            : {}
        }
      >
        <Breadcrumb links={[{ children: 'Accounts' }]} />

        {loading ? (
          <SettingsAccountLoader />
        ) : (
          <>
            <SettingsAccountsConnectedAccountsSection accounts={accounts} />
            <SettingsAccountsSettingsSection />
          </>
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
