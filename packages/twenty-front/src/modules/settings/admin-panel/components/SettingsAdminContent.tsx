import { currentUserState } from '@/auth/states/currentUserState';
import { SettingsAdminTabContent } from '@/settings/admin-panel/components/SettingsAdminTabContent';
import { SETTINGS_ADMIN_TABS } from '@/settings/admin-panel/constants/SettingsAdminTabs';
import { SETTINGS_ADMIN_TABS_ID } from '@/settings/admin-panel/constants/SettingsAdminTabsId';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { IconApps, IconSettings2, IconSparkles } from 'twenty-ui/icon';

export const SettingsAdminContent = () => {
  const currentUser = useAtomStateValue(currentUserState);

  const canAccessFullAdminPanel = currentUser?.canAccessFullAdminPanel;
  const canImpersonate = currentUser?.canImpersonate;
  const tabs = [
    {
      id: SETTINGS_ADMIN_TABS.GENERAL,
      title: t`General`,
      Icon: IconSettings2,
      disabled: !canAccessFullAdminPanel && !canImpersonate,
    },
    {
      id: SETTINGS_ADMIN_TABS.APPS,
      title: t`Apps`,
      Icon: IconApps,
      disabled: !canAccessFullAdminPanel,
    },
    {
      id: SETTINGS_ADMIN_TABS.AI,
      title: t`AI`,
      Icon: IconSparkles,
      disabled: !canAccessFullAdminPanel,
    },
  ];

  return (
    <>
      <TabList
        tabs={tabs}
        behaveAsLinks={true}
        componentInstanceId={SETTINGS_ADMIN_TABS_ID}
      />
      <SettingsAdminTabContent />
    </>
  );
};
