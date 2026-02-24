import { currentUserState } from '@/auth/states/currentUserState';
import { SettingsAdminTabContent } from '@/settings/admin-panel/components/SettingsAdminTabContent';
import { SETTINGS_ADMIN_TABS } from '@/settings/admin-panel/constants/SettingsAdminTabs';
import { SETTINGS_ADMIN_TABS_ID } from '@/settings/admin-panel/constants/SettingsAdminTabsId';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { t } from '@lingui/core/macro';
import {
  IconHeart,
  IconSettings2,
  IconSparkles,
  IconVariable,
} from 'twenty-ui/display';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

export const SettingsAdminContent = () => {
  const currentUser = useRecoilValueV2(currentUserState);

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
      id: SETTINGS_ADMIN_TABS.AI,
      title: t`AI`,
      Icon: IconSparkles,
      disabled: !canAccessFullAdminPanel,
    },
    {
      id: SETTINGS_ADMIN_TABS.CONFIG_VARIABLES,
      title: t`Config`,
      Icon: IconVariable,
      disabled: !canAccessFullAdminPanel,
    },
    {
      id: SETTINGS_ADMIN_TABS.HEALTH_STATUS,
      title: t`Health`,
      Icon: IconHeart,
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
