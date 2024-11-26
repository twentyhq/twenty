import { SettingsAdminFeatureFlags } from '@/settings/admin-panel/components/SettingsAdminFeatureFlags';
import { SettingsAdminImpersonateUsers } from '@/settings/admin-panel/components/SettingsAdminImpersonateUsers';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';

export const SettingsAdmin = () => {
  return (
    <SubMenuTopBarContainer title="Admin Panel" links={[{ children: 'Admin' }]}>
      <SettingsPageContainer>
        <SettingsAdminImpersonateUsers />
        <SettingsAdminFeatureFlags />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
