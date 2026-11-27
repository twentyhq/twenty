import { type SettingsTabDefinition } from '@/settings/types/SettingsTabDefinition';
import { SETTINGS_AI_TAB_IDS } from '@/settings/ai/constants/SettingsAiTabIds';
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
  TABS_IDS: SETTINGS_AI_TAB_IDS,
  TABS: [
    {
      id: SETTINGS_AI_TAB_IDS.OVERVIEW,
      title: msg`Overview`,
      Icon: IconLayoutDashboard,
      requiredFeatureFlag: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
    },
    { id: SETTINGS_AI_TAB_IDS.MCP, title: msg`MCP`, Icon: IconSparkles },
    { id: SETTINGS_AI_TAB_IDS.MODELS, title: msg`Models`, Icon: IconCpu },
    { id: SETTINGS_AI_TAB_IDS.SKILLS, title: msg`Skills`, Icon: IconBook },
    { id: SETTINGS_AI_TAB_IDS.TOOLS, title: msg`Tools`, Icon: IconTool },
    { id: SETTINGS_AI_TAB_IDS.USAGE, title: msg`Usage`, Icon: IconChartBar },
  ] satisfies SettingsTabDefinition[],
};
