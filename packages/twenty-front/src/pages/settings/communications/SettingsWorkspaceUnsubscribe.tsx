import { useLingui } from '@lingui/react/macro';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import { SettingsWorkspaceUnsubscribeTopicSection } from '@/settings/unsubscribe-topics/components/SettingsWorkspaceUnsubscribeTopicSection';
import { SettingsUnsubscribePreview } from '@/settings/unsubscribers/components/SettingsUnsubscribePreview';
import { SettingsUnsubscribersList } from '@/settings/unsubscribers/components/SettingsUnsubscribersList';
import { SETTINGS_UNSUBSCRIBE_TAB_IDS } from '@/settings/unsubscribers/constants/SettingsUnsubscribeTabIds';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconEye, IconForbid, IconMailCog } from 'twenty-ui/icon';

const UNSUBSCRIBE_TABS_INSTANCE_ID = 'settings-unsubscribe-tabs';

export const SettingsWorkspaceUnsubscribe = () => {
  const { t } = useLingui();

  const isMessageCampaignEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED,
  );

  const tabs = [
    {
      id: SETTINGS_UNSUBSCRIBE_TAB_IDS.UNSUBSCRIBERS,
      title: t`Opt-outs`,
      Icon: IconForbid,
    },
    {
      id: SETTINGS_UNSUBSCRIBE_TAB_IDS.TOPICS,
      title: t`Topics`,
      Icon: IconMailCog,
    },
    {
      id: SETTINGS_UNSUBSCRIBE_TAB_IDS.PREVIEW,
      title: t`Unsubscribe page`,
      Icon: IconEye,
    },
  ];

  const activeTabId = useSettingsActiveTabId(
    UNSUBSCRIBE_TABS_INSTANCE_ID,
    tabs.map((tab) => tab.id),
  );

  if (!isMessageCampaignEnabled) {
    return null;
  }

  return (
    <SettingsPageLayout
      title={t`Unsubscribe`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        {
          children: t`Communication`,
          href: getSettingsPath(SettingsPath.WorkspaceCommunications),
        },
        { children: t`Unsubscribe` },
      ]}
      secondaryBar={
        <SettingsTabBar
          aria-label={t`Unsubscribe settings`}
          tabs={tabs}
          componentInstanceId={UNSUBSCRIBE_TABS_INSTANCE_ID}
        />
      }
    >
      <SettingsPageContainer>
        {activeTabId === SETTINGS_UNSUBSCRIBE_TAB_IDS.UNSUBSCRIBERS && (
          <SettingsUnsubscribersList />
        )}
        {activeTabId === SETTINGS_UNSUBSCRIBE_TAB_IDS.TOPICS && (
          <SettingsWorkspaceUnsubscribeTopicSection />
        )}
        {activeTabId === SETTINGS_UNSUBSCRIBE_TAB_IDS.PREVIEW && (
          <SettingsUnsubscribePreview />
        )}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
