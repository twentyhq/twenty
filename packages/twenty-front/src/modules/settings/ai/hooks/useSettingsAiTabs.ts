import { SETTINGS_AI_TABS } from '@/settings/ai/constants/SettingsAiTabs';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { t } from '@lingui/core/macro';
import {
  IconBook,
  IconChartBar,
  IconCpu,
  IconLayoutDashboard,
  IconSparkles,
  IconTool,
} from 'twenty-ui/icon';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useSettingsAiTabs = () => {
  const isInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );

  const tabs = [
    ...(isInboxEnabled
      ? [
          {
            id: SETTINGS_AI_TABS.TABS_IDS.OVERVIEW,
            title: t`Overview`,
            Icon: IconLayoutDashboard,
          },
        ]
      : []),
    {
      id: SETTINGS_AI_TABS.TABS_IDS.MCP,
      title: t`MCP`,
      Icon: IconSparkles,
    },
    {
      id: SETTINGS_AI_TABS.TABS_IDS.MODELS,
      title: t`Models`,
      Icon: IconCpu,
    },
    {
      id: SETTINGS_AI_TABS.TABS_IDS.SKILLS,
      title: t`Skills`,
      Icon: IconBook,
    },
    {
      id: SETTINGS_AI_TABS.TABS_IDS.TOOLS,
      title: t`Tools`,
      Icon: IconTool,
    },
    {
      id: SETTINGS_AI_TABS.TABS_IDS.USAGE,
      title: t`Usage`,
      Icon: IconChartBar,
    },
  ];

  const activeTabId =
    useSettingsActiveTabId(
      SETTINGS_AI_TABS.COMPONENT_INSTANCE_ID,
      tabs.map((tab) => tab.id),
    ) ??
    (isInboxEnabled
      ? SETTINGS_AI_TABS.TABS_IDS.OVERVIEW
      : SETTINGS_AI_TABS.TABS_IDS.MCP);

  return { tabs, activeTabId };
};
