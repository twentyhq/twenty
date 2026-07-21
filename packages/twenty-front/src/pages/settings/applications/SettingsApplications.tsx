import { SettingsDiscoveryHeroCard } from '@/settings/components/SettingsDiscoveryHeroCard';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconApps, IconCode, IconDownload, IconPlug } from 'twenty-ui/icon';
import { Section } from 'twenty-ui/layout';
import coverDark from '~/pages/settings/applications/assets/cover-dark.png';
import coverLight from '~/pages/settings/applications/assets/cover-light.png';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { SettingsApplicationsClaimErrorTabEffect } from '~/pages/settings/applications/components/SettingsApplicationsClaimErrorTabEffect';
import { SettingsApplicationsAvailableTab } from '~/pages/settings/applications/tabs/SettingsApplicationsAvailableTab';
import { SettingsApplicationsDeveloperTab } from '~/pages/settings/applications/tabs/SettingsApplicationsDeveloperTab';
import { SettingsApplicationsInstalledTab } from '~/pages/settings/applications/tabs/SettingsApplicationsInstalledTab';

const APPLICATIONS_TAB_LIST_ID = 'applications-tab-list';
const APPLICATIONS_HERO_INSTANCE_ID_PREFIX = 'settings-applications-hero';
const DEVELOPER_TAB_ID = 'developer';

export const SettingsApplications = () => {
  const { t } = useLingui();

  const hasDeveloperAccess = useHasPermissionFlag(
    PermissionFlagType.API_KEYS_AND_WEBHOOKS,
  );

  const tabs = [
    { id: 'marketplace', title: t`Marketplace`, Icon: IconDownload },
    { id: 'installed', title: t`Installed`, Icon: IconApps },
    ...(hasDeveloperAccess
      ? [{ id: DEVELOPER_TAB_ID, title: t`Developer`, Icon: IconCode }]
      : []),
  ];

  const activeTabId = useSettingsActiveTabId(
    APPLICATIONS_TAB_LIST_ID,
    tabs.map((tab) => tab.id),
  );

  const renderActiveTabContent = () => {
    switch (activeTabId) {
      case 'marketplace':
        return <SettingsApplicationsAvailableTab />;
      case 'installed':
        return <SettingsApplicationsInstalledTab />;
      case 'developer':
        return <SettingsApplicationsDeveloperTab />;
      default:
        return <SettingsApplicationsAvailableTab />;
    }
  };

  return (
    <SettingsPageLayout
      title={t`Applications`}
      secondaryBar={
        <SettingsTabBar
          tabs={tabs}
          componentInstanceId={APPLICATIONS_TAB_LIST_ID}
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
      <SettingsApplicationsClaimErrorTabEffect
        tabListId={APPLICATIONS_TAB_LIST_ID}
        developerTabId={DEVELOPER_TAB_ID}
        hasDeveloperAccess={hasDeveloperAccess}
      />
      <SettingsPageContainer>
        <Section>
          <SettingsDiscoveryHeroCard
            lightSrc={coverLight}
            darkSrc={coverDark}
            instanceIdPrefix={APPLICATIONS_HERO_INSTANCE_ID_PREFIX}
            tabs={[
              {
                id: 'browse',
                title: t`Browse`,
                Icon: IconDownload,
                vimeoId: '1185416793',
              },
              {
                id: 'install',
                title: t`Install`,
                Icon: IconApps,
                vimeoId: '1185416793',
              },
              {
                id: 'develop',
                title: t`Develop`,
                Icon: IconPlug,
                vimeoId: '1185416793',
              },
            ]}
            playButtonAriaLabel={t`Watch apps demo`}
          />
        </Section>
        {renderActiveTabContent()}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
