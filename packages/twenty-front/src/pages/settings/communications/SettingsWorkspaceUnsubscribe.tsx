import { useLingui } from '@lingui/react/macro';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import { SettingsWorkspaceUnsubscribeTopicSection } from '@/settings/unsubscribe-topics/components/SettingsWorkspaceUnsubscribeTopicSection';
import { SettingsUnsubscribePreview } from '@/settings/unsubscribers/components/SettingsUnsubscribePreview';
import { SettingsUnsubscribersList } from '@/settings/unsubscribers/components/SettingsUnsubscribersList';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconEye, IconForbid, IconMailCog } from 'twenty-ui/icon';

const UNSUBSCRIBE_TABS_INSTANCE_ID = 'settings-unsubscribe-tabs';

const UNSUBSCRIBE_TAB_IDS = {
  UNSUBSCRIBERS: 'unsubscribers',
  TOPICS: 'topics',
  PREVIEW: 'preview',
} as const;

export const SettingsWorkspaceUnsubscribe = () => {
  const { t } = useLingui();

  const isEmailGroupEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_EMAIL_GROUP_ENABLED,
  );

  const tabs = [
    {
      id: UNSUBSCRIBE_TAB_IDS.UNSUBSCRIBERS,
      title: t`Unsubscribers`,
      Icon: IconForbid,
    },
    {
      id: UNSUBSCRIBE_TAB_IDS.TOPICS,
      title: t`Topics`,
      Icon: IconMailCog,
    },
    {
      id: UNSUBSCRIBE_TAB_IDS.PREVIEW,
      title: t`Unsubscribe page`,
      Icon: IconEye,
    },
  ];

  const activeTabId = useSettingsActiveTabId(
    UNSUBSCRIBE_TABS_INSTANCE_ID,
    tabs.map((tab) => tab.id),
  );

  if (!isEmailGroupEnabled) {
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
    >
      <SettingsPageContainer>
        <TabList
          tabs={tabs}
          componentInstanceId={UNSUBSCRIBE_TABS_INSTANCE_ID}
        />
        {activeTabId === UNSUBSCRIBE_TAB_IDS.UNSUBSCRIBERS && (
          <SettingsUnsubscribersList />
        )}
        {activeTabId === UNSUBSCRIBE_TAB_IDS.TOPICS && (
          <SettingsWorkspaceUnsubscribeTopicSection />
        )}
        {activeTabId === UNSUBSCRIBE_TAB_IDS.PREVIEW && (
          <SettingsUnsubscribePreview />
        )}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
