import { SettingsAccountsLegacySections } from '@/settings/accounts/components/SettingsAccountsLegacySections';
import { SettingsAccountsMessageChannelsSSEEffect } from '@/settings/accounts/components/SettingsAccountsMessageChannelsSSEEffect';
import { SettingsAppPreferencesAccountsTab } from '@/settings/app-preferences/components/SettingsAppPreferencesAccountsTab';
import { SettingsAppPreferencesAppsSection } from '@/settings/app-preferences/components/SettingsAppPreferencesAppsSection';
import { SETTINGS_APP_PREFERENCES_TAB_IDS } from '@/settings/app-preferences/constants/SettingsAppPreferencesTabIds';
import { SETTINGS_APP_PREFERENCES_TAB_LIST_COMPONENT_ID } from '@/settings/app-preferences/constants/SettingsAppPreferencesTabListComponentId';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconApps, IconAt } from 'twenty-ui/icon';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const SettingsAccounts = () => {
  const { t } = useLingui();

  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );
  const pageTitle = isAppPreferencesEnabled ? t`Apps preferences` : t`Account`;

  const tabs = [
    {
      id: SETTINGS_APP_PREFERENCES_TAB_IDS.APPS,
      title: t`Apps`,
      Icon: IconApps,
    },
    {
      id: SETTINGS_APP_PREFERENCES_TAB_IDS.ACCOUNTS,
      title: t`Accounts`,
      Icon: IconAt,
    },
  ];

  const activeTabId = useSettingsActiveTabId(
    SETTINGS_APP_PREFERENCES_TAB_LIST_COMPONENT_ID,
    tabs.map((tab) => tab.id),
  );

  return (
    <SettingsPageLayout
      title={pageTitle}
      links={[
        {
          children: t`User`,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        { children: pageTitle },
      ]}
      secondaryBar={
        isAppPreferencesEnabled ? (
          <SettingsTabBar
            aria-label={pageTitle}
            tabs={tabs}
            componentInstanceId={SETTINGS_APP_PREFERENCES_TAB_LIST_COMPONENT_ID}
          />
        ) : undefined
      }
    >
      <SettingsAccountsMessageChannelsSSEEffect />
      <SettingsPageContainer>
        {isAppPreferencesEnabled ? (
          <>
            {activeTabId === SETTINGS_APP_PREFERENCES_TAB_IDS.APPS && (
              <SettingsAppPreferencesAppsSection />
            )}
            {activeTabId === SETTINGS_APP_PREFERENCES_TAB_IDS.ACCOUNTS && (
              <SettingsAppPreferencesAccountsTab />
            )}
          </>
        ) : (
          <SettingsAccountsLegacySections />
        )}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
