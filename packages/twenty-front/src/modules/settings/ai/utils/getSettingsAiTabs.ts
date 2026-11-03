import { SETTINGS_AI_TABS } from '@/settings/ai/constants/SettingsAiTabs';
import { t } from '@lingui/core/macro';
import {
  IconBook,
  IconChartBar,
  IconCpu,
  IconLayoutDashboard,
  IconSparkles,
  IconTool,
} from 'twenty-ui/icon';

export const getSettingsAiTabs = (isInboxEnabled: boolean) => [
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
