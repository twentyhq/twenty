import { SettingsAdminTabContent } from '@/settings/admin-panel/components/SettingsAdminTabContent';
import { SETTINGS_ADMIN_TABS_ID } from '@/settings/admin-panel/constants/SettingsAdminTabsId';
import { useSettingsAdminTabs } from '@/settings/admin-panel/hooks/useSettingsAdminTabs';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

export const SettingsAdmin = () => {
  const { t } = useLingui();
  const tabs = useSettingsAdminTabs();
  const activeTabId = useSettingsActiveTabId(
    SETTINGS_ADMIN_TABS_ID,
    tabs.map((tab) => tab.id),
  );

  return (
    <SettingsPageLayout
      title={t`Admin Panel`}
      secondaryBar={
        <SettingsTabBar
          tabs={tabs}
          componentInstanceId={SETTINGS_ADMIN_TABS_ID}
        />
      }
      links={[
        {
          children: t`Other`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        { children: t`Admin Panel` },
      ]}
    >
      <SettingsPageContainer>
        <SettingsAdminTabContent activeTabId={activeTabId} />
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
