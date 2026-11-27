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

export const SETTINGS_AI_TABS = {
  COMPONENT_INSTANCE_ID: 'settings-ai-tab-list',
  TABS_IDS: {
    OVERVIEW: 'overview',
    MCP: 'mcp',
    MODELS: 'models',
    SKILLS: 'skills',
    TOOLS: 'tools',
    USAGE: 'usage',
  } as const,
  TABS: [
    {
      id: 'overview',
      title: msg`Overview`,
      Icon: IconLayoutDashboard,
      requiredFeatureFlag: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
    },
    { id: 'mcp', title: msg`MCP`, Icon: IconSparkles },
    { id: 'models', title: msg`Models`, Icon: IconCpu },
    { id: 'skills', title: msg`Skills`, Icon: IconBook },
    { id: 'tools', title: msg`Tools`, Icon: IconTool },
    { id: 'usage', title: msg`Usage`, Icon: IconChartBar },
  ] satisfies SettingsTabDefinition[],
};
