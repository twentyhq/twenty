import { SettingsAdminGeneral } from '@/settings/admin-panel/components/SettingsAdminGeneral';
import { SettingsAdminConfigVariables } from '@/settings/admin-panel/config-variables/components/SettingsAdminConfigVariables';
import { SETTINGS_ADMIN_TABS } from '@/settings/admin-panel/constants/SettingsAdminTabs';
import { SETTINGS_ADMIN_TABS_ID } from '@/settings/admin-panel/constants/SettingsAdminTabsId';
import { SettingsAdminHealthStatus } from '@/settings/admin-panel/health-status/components/SettingsAdminHealthStatus';
import { activeTabIdComponentState } from '@/ui/layout/tab/states/activeTabIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const SettingsAdminTabContent = () => {
  const activeTabId = useRecoilComponentValueV2(
    activeTabIdComponentState,
    SETTINGS_ADMIN_TABS_ID,
  );

  switch (activeTabId) {
    case SETTINGS_ADMIN_TABS.GENERAL:
      return <SettingsAdminGeneral />;
    case SETTINGS_ADMIN_TABS.CONFIG_VARIABLES:
      return <SettingsAdminConfigVariables />;
    case SETTINGS_ADMIN_TABS.HEALTH_STATUS:
      return <SettingsAdminHealthStatus />;
    case SETTINGS_ADMIN_TABS.CHECK_1:
      return <div>Check 1</div>;
    case SETTINGS_ADMIN_TABS.CHECK_2:
      return <div>Check 2</div>;
    case SETTINGS_ADMIN_TABS.CHECK_3:
      return <div>Check 3</div>;
    case SETTINGS_ADMIN_TABS.CHECK_4:
      return <div>Check 4</div>;
    case SETTINGS_ADMIN_TABS.CHECK_5:
      return <div>Check 5</div>;
    case SETTINGS_ADMIN_TABS.CHECK_6:
      return <div>Check 6</div>;
    case SETTINGS_ADMIN_TABS.CHECK_7:
      return <div>Check 7</div>;
    case SETTINGS_ADMIN_TABS.CHECK_8:
      return <div>Check 8</div>;
    default:
      return null;
  }
};
