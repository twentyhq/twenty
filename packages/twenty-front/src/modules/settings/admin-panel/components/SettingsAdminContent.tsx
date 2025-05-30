import { currentUserState } from '@/auth/states/currentUserState';
import { SettingsAdminTabContent } from '@/settings/admin-panel/components/SettingsAdminTabContent';
import { SETTINGS_ADMIN_TABS } from '@/settings/admin-panel/constants/SettingsAdminTabs';
import { SETTINGS_ADMIN_TABS_ID } from '@/settings/admin-panel/constants/SettingsAdminTabsId';
import { TabList } from '@/ui/layout/tab/components/TabList';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { IconHeart, IconSettings2, IconVariable } from 'twenty-ui/display';

export const SettingsAdminContent = () => {
  const currentUser = useRecoilValue(currentUserState);

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
      id: SETTINGS_ADMIN_TABS.CONFIG_VARIABLES,
      title: t`Config Variables`,
      Icon: IconVariable,
      disabled: !canAccessFullAdminPanel,
    },
    {
      id: SETTINGS_ADMIN_TABS.HEALTH_STATUS,
      title: t`Health Status`,
      Icon: IconHeart,
      disabled: !canAccessFullAdminPanel,
    },
    {
      id: SETTINGS_ADMIN_TABS.CHECK_1,
      title: t`C`,
      Icon: IconHeart,
      disabled: !canAccessFullAdminPanel,
    },
    {
      id: SETTINGS_ADMIN_TABS.CHECK_2,
      title: t`Check 2`,
      Icon: IconHeart,
      disabled: !canAccessFullAdminPanel,
    },
    {
      id: SETTINGS_ADMIN_TABS.CHECK_3,
      title: t`Check 3`,
      Icon: IconHeart,
      disabled: !canAccessFullAdminPanel,
    },
    {
      id: SETTINGS_ADMIN_TABS.CHECK_4,
      title: t`Check 4`,
      Icon: IconHeart,
      disabled: !canAccessFullAdminPanel,
    },
    {
      id: SETTINGS_ADMIN_TABS.CHECK_5,
      title: t`Check 5`,
      Icon: IconHeart,
      disabled: !canAccessFullAdminPanel,
    },
    {
      id: SETTINGS_ADMIN_TABS.CHECK_6,
      title: t`Check 6`,
      Icon: IconHeart,
      disabled: !canAccessFullAdminPanel,
    },
    {
      id: SETTINGS_ADMIN_TABS.CHECK_7,
      title: t`Check 7`,
      Icon: IconHeart,
      disabled: !canAccessFullAdminPanel,
    },
    {
      id: SETTINGS_ADMIN_TABS.CHECK_8,
      title: t`Check 8`,
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
