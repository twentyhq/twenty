import { SettingsAdminAI } from '@/settings/admin-panel/ai/components/SettingsAdminAI';
import { SettingsAdminApps } from '@/settings/admin-panel/apps/components/SettingsAdminApps';
import { SettingsAdminGeneral } from '@/settings/admin-panel/components/SettingsAdminGeneral';
import { SettingsAdminConfigVariables } from '@/settings/admin-panel/config-variables/components/SettingsAdminConfigVariables';
import { SETTINGS_ADMIN_TABS } from '@/settings/admin-panel/constants/SettingsAdminTabs';
import { SettingsAdminHealthStatus } from '@/settings/admin-panel/health-status/components/SettingsAdminHealthStatus';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { lazy, Suspense } from 'react';

const SettingsEnterprise = lazy(() =>
  import('~/pages/settings/enterprise/SettingsEnterprise').then((module) => ({
    default: module.SettingsEnterprise,
  })),
);
export const SettingsAdminTabContent = ({
  activeTabId,
}: {
  activeTabId: string | null;
}) => {
  switch (activeTabId) {
    case SETTINGS_ADMIN_TABS.GENERAL:
      return <SettingsAdminGeneral />;
    case SETTINGS_ADMIN_TABS.APPS:
      return <SettingsAdminApps />;
    case SETTINGS_ADMIN_TABS.AI:
      return <SettingsAdminAI />;
    case SETTINGS_ADMIN_TABS.CONFIG_VARIABLES:
      return <SettingsAdminConfigVariables />;
    case SETTINGS_ADMIN_TABS.HEALTH_STATUS:
      return <SettingsAdminHealthStatus />;
    case SETTINGS_ADMIN_TABS.ENTERPRISE:
      return (
        <Suspense fallback={<SettingsSectionSkeletonLoader />}>
          <SettingsEnterprise isAdminPanelTab />
        </Suspense>
      );
    default:
      return null;
  }
};
