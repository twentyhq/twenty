import { type SettingsTabDefinition } from '@/settings/types/SettingsTabDefinition';
import { msg } from '@lingui/core/macro';
import {
  IconBook,
  IconChartBar,
  IconCpu,
  IconLayoutDashboard,
  IconSparkles,
  IconTool,
} from 'twenty-ui/icon';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const TABS_IDS = {
  OVERVIEW: 'overview',
  MCP: 'mcp',
  MODELS: 'models',
  SKILLS: 'skills',
  TOOLS: 'tools',
  USAGE: 'usage',
} as const;

export const SETTINGS_AI_TABS = {
  COMPONENT_INSTANCE_ID: 'settings-ai-tab-list',
  TABS_IDS,
  TABS: [
    {
      id: TABS_IDS.OVERVIEW,
      title: msg`Overview`,
      Icon: IconLayoutDashboard,
      requiredFeatureFlag: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
    },
    { id: TABS_IDS.MCP, title: msg`MCP`, Icon: IconSparkles },
    { id: TABS_IDS.MODELS, title: msg`Models`, Icon: IconCpu },
    { id: TABS_IDS.SKILLS, title: msg`Skills`, Icon: IconBook },
    { id: TABS_IDS.TOOLS, title: msg`Tools`, Icon: IconTool },
    { id: TABS_IDS.USAGE, title: msg`Usage`, Icon: IconChartBar },
  ] satisfies SettingsTabDefinition[],
};
