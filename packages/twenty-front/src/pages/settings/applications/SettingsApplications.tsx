import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconApps, IconCode, IconDownload } from 'twenty-ui/display';
import { useQuery } from '@apollo/client/react';
import {
  FeatureFlagKey,
  PermissionFlagType,
  FindManyApplicationsDocument,
} from '~/generated-metadata/graphql';
import { SettingsApplicationsTable } from '~/pages/settings/applications/components/SettingsApplicationsTable';
import { SettingsApplicationsAvailableTab } from '~/pages/settings/applications/tabs/SettingsApplicationsAvailableTab';
import { SettingsApplicationsDeveloperTab } from '~/pages/settings/applications/tabs/SettingsApplicationsDeveloperTab';
import { SettingsApplicationsInstalledTab } from '~/pages/settings/applications/tabs/SettingsApplicationsInstalledTab';

const APPLICATIONS_TAB_LIST_ID = 'applications-tab-list';

export const SettingsApplications = () => {
  const { t } = useLingui();

  const hasDeveloperAccess = useHasPermissionFlag(
    PermissionFlagType.API_KEYS_AND_WEBHOOKS,
  );

  const isMarketplaceSettingTabVisible = useIsFeatureEnabled(
    FeatureFlagKey.IS_MARKETPLACE_SETTING_TAB_VISIBLE,
  );

  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    APPLICATIONS_TAB_LIST_ID,
  );

  const tabs = [
    ...(isMarketplaceSettingTabVisible
      ? [{ id: 'marketplace', title: t`Marketplace`, Icon: IconDownload }]
      : []),
    { id: 'installed', title: t`Installed`, Icon: IconApps },
    ...(hasDeveloperAccess
      ? [{ id: 'developer', title: t`Developer`, Icon: IconCode }]
      : []),
  ];

  const renderActiveTabContent = () => {
    switch (activeTabId) {
      case 'marketplace':
        return <SettingsApplicationsAvailableTab />;
      case 'installed':
        return <SettingsApplicationsInstalledTab />;
      case 'developer':
        return <SettingsApplicationsDeveloperTab />;
      default:
        return isMarketplaceSettingTabVisible ? (
          <SettingsApplicationsAvailableTab />
        ) : (
          <SettingsApplicationsInstalledTab />
        );
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
        <TabList tabs={tabs} componentInstanceId={APPLICATIONS_TAB_LIST_ID} />
        {renderActiveTabContent()}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
