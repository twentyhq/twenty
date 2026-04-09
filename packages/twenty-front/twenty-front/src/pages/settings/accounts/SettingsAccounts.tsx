import { SettingsPath } from 'twenty-shared/types';
import { SettingsAccountLoader } from '@/settings/accounts/components/SettingsAccountLoader';
import { SettingsAccountsBlocklistSection } from '@/settings/accounts/components/SettingsAccountsBlocklistSection';
import { SettingsAccountsConnectedAccountsListCard } from '@/settings/accounts/components/SettingsAccountsConnectedAccountsListCard';
import { SettingsAccountsSettingsSection } from '@/settings/accounts/components/SettingsAccountsSettingsSection';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useLingui } from '@lingui/react/macro';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

export const SettingsAccounts = () => {
  const { t } = useLingui();

  const { accounts: allAccounts, loading } = useMyConnectedAccounts();

  return (
    <SubMenuTopBarContainer
      title={t`Account`}
      links={[
        {
          children: t`User`,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        { children: t`Account` },
      ]}
    >
      <SettingsPageContainer>
        {loading ? (
          <SettingsAccountLoader />
        ) : (
          <>
            <Section>
              <H2Title
                title={t`Connected accounts`}
                description={t`Manage your internet accounts.`}
              />
              <SettingsAccountsConnectedAccountsListCard
                accounts={allAccounts}
              />
            </Section>
            <SettingsAccountsBlocklistSection />
            <SettingsAccountsSettingsSection />
          </>
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
