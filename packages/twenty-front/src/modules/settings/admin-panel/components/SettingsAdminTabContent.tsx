import { SettingsAdminEnvVariables } from '@/settings/admin-panel/components/SettingsAdminEnvVariables';
import { SettingsAdminGeneral } from '@/settings/admin-panel/components/SettingsAdminGeneral';
import { SETTINGS_ADMIN_TABS } from '@/settings/admin-panel/constants/SettingsAdminTabs';
import { SettingsAdminHealthStatus } from '@/settings/admin-panel/health-status/components/SettingsAdminHealthStatus';
import { activeTabIdComponentState } from '@/ui/layout/tab/states/activeTabIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const SettingsAdminTabContent = () => {
  const activeTabId = useRecoilComponentValueV2(activeTabIdComponentState);

  switch (activeTabId) {
    case SETTINGS_ADMIN_TABS.GENERAL:
      return <SettingsAdminGeneral />;
    case SETTINGS_ADMIN_TABS.ENV_VARIABLES:
      return <SettingsAdminEnvVariables />;
    case SETTINGS_ADMIN_TABS.HEALTH_STATUS:
      return <SettingsAdminHealthStatus />;
    default:
      return null;
  }
};
