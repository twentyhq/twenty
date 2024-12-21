import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { SettingsAdminContent } from '@/settings/admin-panel/components/SettingsAdminContent';

export const SettingsAdmin = () => {
  return (
    <SubMenuTopBarContainer
      title="Server Admin Panel"
      links={[
        {
          children: 'Other',
          href: getSettingsPagePath(SettingsPath.AdminPanel),
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
