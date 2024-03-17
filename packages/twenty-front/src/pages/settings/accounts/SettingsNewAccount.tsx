import { Breadcrumb } from 'twenty-ui';

import { SettingsNewAccountSection } from '@/settings/accounts/components/SettingsNewAccountSection';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { IconSettings } from '@/ui/display/icon';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';

export const SettingsNewAccount = () => {
  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <Breadcrumb
          links={[
            { children: 'Accounts', href: '/settings/accounts' },
            { children: `New` },
          ]}
        />
        <SettingsNewAccountSection />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
