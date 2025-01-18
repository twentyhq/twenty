import { SettingsNewAccountSection } from '@/settings/accounts/components/SettingsNewAccountSection';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { settingsLink } from '~/utils/navigation/settingsLink';

export const SettingsNewAccount = () => {
  return (
    <SubMenuTopBarContainer
      title="New Account"
      links={[
        {
          children: 'User',
          href: settingsLink(SettingsPath.ProfilePage),
        },
        {
          children: 'Accounts',
          href: settingsLink(SettingsPath.Accounts),
        },
        { children: `New` },
      ]}
    >
      <SettingsPageContainer>
        <SettingsNewAccountSection />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
