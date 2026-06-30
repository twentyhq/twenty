import { SettingsAdminAI } from '@/settings/admin-panel/ai/components/SettingsAdminAI';
import { SettingsAdminApps } from '@/settings/admin-panel/apps/components/SettingsAdminApps';
import { SettingsAdminGeneral } from '@/settings/admin-panel/components/SettingsAdminGeneral';
import { SETTINGS_ADMIN_TABS } from '@/settings/admin-panel/constants/SettingsAdminTabs';
import { SETTINGS_ADMIN_TABS_ID } from '@/settings/admin-panel/constants/SettingsAdminTabsId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const SettingsAdminTabContent = () => {
  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    SETTINGS_ADMIN_TABS_ID,
  );

  switch (activeTabId) {
    case SETTINGS_ADMIN_TABS.GENERAL:
      return <SettingsAdminGeneral />;
    case SETTINGS_ADMIN_TABS.APPS:
      return <SettingsAdminApps />;
    case SETTINGS_ADMIN_TABS.AI:
      return <SettingsAdminAI />;
    default:
      return null;
  }
};
