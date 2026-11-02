import { SETTINGS_AI_TABS } from '@/settings/ai/constants/SettingsAiTabs';
import { getSettingsAiTabs } from '@/settings/ai/utils/getSettingsAiTabs';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useSettingsAiTabs = () => {
  const isInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );

  const tabs = getSettingsAiTabs(isInboxEnabled);

  const activeTabId = useSettingsActiveTabId(
    SETTINGS_AI_TABS.COMPONENT_INSTANCE_ID,
    tabs.map((tab) => tab.id),
  );

  return { tabs, activeTabId };
};
