import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { FeatureFlagKey, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { t } from '@lingui/core/macro';
import {
  IconChartBar,
  IconCpu,
  IconSettingsBolt,
  IconSparkles,
  IconTool,
} from 'twenty-ui/display';
import { SettingsAIMoreTab } from '~/pages/settings/ai/components/SettingsAIMoreTab';
import { SettingsAIModelsTab } from './components/SettingsAIModelsTab';
import { SettingsAIUsageTab } from './components/SettingsAIUsageTab';
import { SettingsAgentSkills } from './components/SettingsAgentSkills';
import { SettingsToolsTable } from './components/SettingsToolsTable';
import { SETTINGS_AI_TABS } from './constants/SettingsAiTabs';

export const SettingsAI = () => {
  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    SETTINGS_AI_TABS.COMPONENT_INSTANCE_ID,
  );

  const isUsageAnalyticsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_USAGE_ANALYTICS_ENABLED,
  );

  const tabs = [
    {
      id: SETTINGS_AI_TABS.TABS_IDS.MODELS,
      title: t`Models`,
      Icon: IconCpu,
    },
    {
      id: SETTINGS_AI_TABS.TABS_IDS.SKILLS,
      title: t`Skills`,
      Icon: IconSparkles,
    },
    {
      id: SETTINGS_AI_TABS.TABS_IDS.TOOLS,
      title: t`Tools`,
      Icon: IconTool,
    },
    ...(isUsageAnalyticsEnabled
      ? [
          {
            id: SETTINGS_AI_TABS.TABS_IDS.USAGE,
            title: t`Usage`,
            Icon: IconChartBar,
          },
        ]
      : []),
    {
      id: SETTINGS_AI_TABS.TABS_IDS.MORE,
      title: t`More`,
      Icon: IconSettingsBolt,
    },
  ];

  const isModelsTab = activeTabId === SETTINGS_AI_TABS.TABS_IDS.MODELS;
  const isSkillsTab = activeTabId === SETTINGS_AI_TABS.TABS_IDS.SKILLS;
  const isToolsTab = activeTabId === SETTINGS_AI_TABS.TABS_IDS.TOOLS;
  const isUsageTab = activeTabId === SETTINGS_AI_TABS.TABS_IDS.USAGE;
  const isMoreTab = activeTabId === SETTINGS_AI_TABS.TABS_IDS.MORE;

  return (
    <SubMenuTopBarContainer
      title={t`AI`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: t`AI` },
      ]}
    >
      <SettingsPageContainer>
        <TabList
          tabs={tabs}
          componentInstanceId={SETTINGS_AI_TABS.COMPONENT_INSTANCE_ID}
        />
        {isModelsTab && <SettingsAIModelsTab />}
        {isSkillsTab && <SettingsAgentSkills />}
        {isToolsTab && <SettingsToolsTable />}
        {isUsageTab && <SettingsAIUsageTab />}
        {isMoreTab && <SettingsAIMoreTab />}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
