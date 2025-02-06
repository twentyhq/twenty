import { SettingsAdminEnvVariables } from '@/settings/admin-panel/components/SettingsAdminEnvVariables';
import { SettingsAdminGeneral } from '@/settings/admin-panel/components/SettingsAdminGeneral';
import { SETTINGS_ADMIN_TABS } from '@/settings/admin-panel/constants/SettingsAdminTabs';
import { SETTINGS_ADMIN_TABS_ID } from '@/settings/admin-panel/constants/SettingsAdminTabsId';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';

export const SettingsAdminTabContent = () => {
  const { activeTabId } = useTabList(SETTINGS_ADMIN_TABS_ID);

  switch (activeTabId) {
    case SETTINGS_ADMIN_TABS.GENERAL:
      return <SettingsAdminGeneral />;
    case SETTINGS_ADMIN_TABS.ENV_VARIABLES:
      return <SettingsAdminEnvVariables />;
    default:
      return null;
  }
};
