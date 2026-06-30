import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { t } from '@lingui/core/macro';
import {
  IconCpu,
  IconLayoutDashboard,
  IconPlus,
  IconSparkles,
  IconTool,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { SettingsAgentSkillsTab } from '~/pages/settings/ai/components/SettingsAgentSkillsTab';
import { SettingsAgentToolsTab } from '~/pages/settings/ai/components/SettingsAgentToolsTab';
import { SettingsAiModelsTab } from '~/pages/settings/ai/components/SettingsAiModelsTab';
import { SettingsAiOverviewTab } from '~/pages/settings/ai/components/SettingsAiOverviewTab';
import { SETTINGS_AI_TABS } from '~/pages/settings/ai/constants/SettingsAiTabs';
import { useCreateTool } from '~/pages/settings/ai/hooks/useCreateTool';

export const SettingsAI = () => {
  const { handleCreateTool, isCreatingTool } = useCreateTool();

  const tabs = [
    {
      id: SETTINGS_AI_TABS.TABS_IDS.OVERVIEW,
      title: t`Overview`,
      Icon: IconLayoutDashboard,
    },
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
  ];

  const resolvedTabId =
    useSettingsActiveTabId(
      SETTINGS_AI_TABS.COMPONENT_INSTANCE_ID,
      tabs.map((tab) => tab.id),
    ) ?? SETTINGS_AI_TABS.TABS_IDS.OVERVIEW;
  const isOverviewTab = resolvedTabId === SETTINGS_AI_TABS.TABS_IDS.OVERVIEW;
  const isModelsTab = resolvedTabId === SETTINGS_AI_TABS.TABS_IDS.MODELS;
  const isSkillsTab = resolvedTabId === SETTINGS_AI_TABS.TABS_IDS.SKILLS;
  const isToolsTab = resolvedTabId === SETTINGS_AI_TABS.TABS_IDS.TOOLS;

  return (
    <SettingsPageLayout
      title={t`AI`}
      secondaryBar={
        <SettingsTabBar
          tabs={tabs}
          componentInstanceId={SETTINGS_AI_TABS.COMPONENT_INSTANCE_ID}
        />
      }
      actionButton={
        isSkillsTab ? (
          <UndecoratedLink to={getSettingsPath(SettingsPath.AiNewSkill)}>
            <Button
              Icon={IconPlus}
              title={t`New Skill`}
              accent="blue"
              size="small"
            />
          </UndecoratedLink>
        ) : isToolsTab ? (
          <Button
            Icon={IconPlus}
            title={t`New Tool`}
            accent="blue"
            size="small"
            onClick={handleCreateTool}
            disabled={isCreatingTool}
          />
        ) : undefined
      }
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        { children: t`AI` },
      ]}
    >
      <SettingsPageContainer>
        {isOverviewTab && <SettingsAiOverviewTab />}
        {isModelsTab && <SettingsAiModelsTab />}
        {isSkillsTab && <SettingsAgentSkillsTab />}
        {isToolsTab && <SettingsAgentToolsTab />}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
