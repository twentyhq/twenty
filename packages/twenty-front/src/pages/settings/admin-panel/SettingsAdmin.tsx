import { SettingsAdminContent } from '@/settings/admin-panel/components/SettingsAdminContent';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { settingsLink } from '~/utils/navigation/settingsLink';

export const SettingsAdmin = () => {
  return (
    <SubMenuTopBarContainer
      title="Server Admin Panel"
      links={[
        {
          children: 'Other',
          href: settingsLink(SettingsPath.AdminPanel),
        },
        { children: 'Server Admin Panel' },
      ]}
    >
      <SettingsPageContainer>
        <SettingsAdminContent />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
