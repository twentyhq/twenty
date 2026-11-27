import { SettingsDiscoveryHeroCard } from '@/settings/components/SettingsDiscoveryHeroCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SETTINGS_APPLICATIONS_TABS } from '@/settings/applications/constants/SettingsApplicationsTabs';
import { SETTINGS_DEVELOPERS_TABS } from '@/settings/developers/constants/SettingsDevelopersTabs';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { getAvailableSettingsTabs } from '@/settings/utils/getAvailableSettingsTabs';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useWorkspaceFeatureFlagsMap } from '@/workspace/hooks/useWorkspaceFeatureFlagsMap';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import { useLingui } from '@lingui/react/macro';
import { Navigate, useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconSparkle2 } from 'twenty-ui/icon';
import coverDark from '~/pages/settings/applications/assets/cover-dark.png';
import coverLight from '~/pages/settings/applications/assets/cover-light.png';
import { SettingsApplicationsAvailableTab } from '~/pages/settings/applications/tabs/SettingsApplicationsAvailableTab';
import { SettingsApplicationsInstalledAppsSection } from '@/settings/applications/components/SettingsApplicationsInstalledAppsSection';

const APPLICATIONS_HERO_INSTANCE_ID_PREFIX = 'settings-applications-hero';
// Docs and older links still point to the developer tab that moved to the Developers page
const LEGACY_DEVELOPER_TAB_HASH = '#developer';

export const SettingsApplications = () => {
  const { t, i18n } = useLingui();
  const location = useLocation();

  const permissionFlagMap = useAtomStateValue(permissionFlagMapSelector);
  const featureFlagsMap = useWorkspaceFeatureFlagsMap();

  const tabs = getAvailableSettingsTabs({
    tabs: SETTINGS_APPLICATIONS_TABS.TABS,
    permissionFlagMap,
    featureFlagsMap,
  }).map(({ id, title, Icon, pill }) => ({
    id,
    title: i18n._(title),
    Icon,
    pill: isDefined(pill) ? i18n._(pill) : undefined,
  }));

  const activeTabId = useSettingsActiveTabId(
    SETTINGS_APPLICATIONS_TABS.COMPONENT_INSTANCE_ID,
    tabs.map((tab) => tab.id),
  );

  const renderActiveTabContent = () => {
    switch (activeTabId) {
      case SETTINGS_APPLICATIONS_TABS.TABS_IDS.MARKETPLACE:
        return <SettingsApplicationsAvailableTab />;
      case SETTINGS_APPLICATIONS_TABS.TABS_IDS.INSTALLED:
        return <SettingsApplicationsInstalledAppsSection />;
      default:
        return <SettingsApplicationsAvailableTab />;
    }
  };

  if (location.hash === LEGACY_DEVELOPER_TAB_HASH) {
    return (
      <Navigate
        to={`${getSettingsPath(SettingsPath.Developers)}${location.search}#${SETTINGS_DEVELOPERS_TABS.TABS_IDS.APPS}`}
        replace
      />
    );
  }

  return (
    <SettingsPageLayout
      title={t`Applications`}
      secondaryBar={
        <SettingsTabBar
          aria-label={t`Applications`}
          tabs={tabs}
          componentInstanceId={SETTINGS_APPLICATIONS_TABS.COMPONENT_INSTANCE_ID}
        />
      }
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        { children: t`Applications` },
      ]}
    >
      <SettingsPageContainer>
        <Section.Root>
          <SettingsDiscoveryHeroCard
            lightSrc={coverLight}
            darkSrc={coverDark}
            instanceIdPrefix={APPLICATIONS_HERO_INSTANCE_ID_PREFIX}
            tabs={[
              {
                id: 'app_marketplace_walkthrough',
                title: t`Walkthrough`,
                Icon: IconSparkle2,
                vimeoId: '1217964666',
                hasSound: true,
              },
            ]}
            playButtonAriaLabel={t`Watch apps demo`}
          />
        </Section.Root>
        {renderActiveTabContent()}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
