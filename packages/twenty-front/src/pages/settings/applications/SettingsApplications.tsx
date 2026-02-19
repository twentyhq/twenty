import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconApps, IconCode, IconDownload } from 'twenty-ui/display';
import {
  type FeatureFlagKey,
  useFindManyApplicationsQuery,
} from '~/generated-metadata/graphql';
import { SettingsApplicationsTable } from '~/pages/settings/applications/components/SettingsApplicationsTable';
import { SettingsApplicationsAvailableTab } from '~/pages/settings/applications/tabs/SettingsApplicationsAvailableTab';
import { SettingsApplicationsCreateTab } from '~/pages/settings/applications/tabs/SettingsApplicationsCreateTab';
import { SettingsApplicationsInstalledTab } from '~/pages/settings/applications/tabs/SettingsApplicationsInstalledTab';

const APPLICATIONS_TAB_LIST_ID = 'applications-tab-list';

export const SettingsApplications = () => {
  const { t } = useLingui();

  const isMarketplaceEnabled = useIsFeatureEnabled(
    'IS_MARKETPLACE_ENABLED' as FeatureFlagKey,
  );

  const activeTabId = useRecoilComponentValueV2(
    activeTabIdComponentState,
    APPLICATIONS_TAB_LIST_ID,
  );

  const { data } = useFindManyApplicationsQuery();

  const applications = data?.findManyApplications ?? [];

  if (!isMarketplaceEnabled) {
    return (
      <SubMenuTopBarContainer
        title={t`Applications`}
        links={[
          {
            children: t`Workspace`,
            href: getSettingsPath(SettingsPath.Workspace),
          },
          { children: t`Applications` },
        ]}
      >
        <SettingsPageContainer>
          {applications.length > 0 && (
            <SettingsApplicationsTable applications={applications} />
          )}
          <SettingsApplicationsCreateTab />
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    );
  }

  const tabs = [
    { id: 'available', title: t`Available`, Icon: IconDownload },
    { id: 'installed', title: t`Installed`, Icon: IconApps },
    { id: 'create', title: t`Create an app`, Icon: IconCode },
  ];

  const renderActiveTabContent = () => {
    switch (activeTabId) {
      case 'available':
        return <SettingsApplicationsAvailableTab />;
      case 'installed':
        return <SettingsApplicationsInstalledTab />;
      case 'create':
        return <SettingsApplicationsCreateTab />;
      default:
        return <SettingsApplicationsAvailableTab />;
    }
  };

  return (
    <SubMenuTopBarContainer
      title={t`Applications`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: t`Applications` },
      ]}
    >
      <SettingsPageContainer>
        <TabList
          tabs={tabs}
          componentInstanceId={APPLICATIONS_TAB_LIST_ID}
          behaveAsLinks={false}
        />
        {renderActiveTabContent()}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
