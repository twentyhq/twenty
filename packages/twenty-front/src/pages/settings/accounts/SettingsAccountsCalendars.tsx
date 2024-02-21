import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { IconSettings } from '@/ui/display/icon';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

export const SettingsAccountsCalendars = () => (
  <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
    <SettingsPageContainer>
      <Breadcrumb
        links={[
          {
            children: 'Accounts',
            href: getSettingsPagePath(SettingsPath.Accounts),
          },
          { children: 'Calendars' },
        ]}
      />
    </SettingsPageContainer>
  </SubMenuTopBarContainer>
);
