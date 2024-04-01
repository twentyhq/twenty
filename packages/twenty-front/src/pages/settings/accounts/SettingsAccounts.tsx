import { useRecoilValue } from 'recoil';
import { IconSettings } from 'twenty-ui';

import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsAccountLoader } from '@/settings/accounts/components/SettingsAccountLoader';
import { SettingsAccountsConnectedAccountsListCard } from '@/settings/accounts/components/SettingsAccountsConnectedAccountsListCard';
import { SettingsAccountsEmailsBlocklistSection } from '@/settings/accounts/components/SettingsAccountsEmailsBlocklistSection';
import { SettingsAccountsSettingsSection } from '@/settings/accounts/components/SettingsAccountsSettingsSection';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

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

  const isBlocklistEnabled = useIsFeatureEnabled('IS_BLOCKLIST_ENABLED');

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
            <Section>
              <H2Title
                title="Connected accounts"
                description="Manage your internet accounts."
              />
              <SettingsAccountsConnectedAccountsListCard
                accounts={accounts}
                loading={loading}
              />
            </Section>
            {isBlocklistEnabled && <SettingsAccountsEmailsBlocklistSection />}
            <SettingsAccountsSettingsSection />
          </>
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
