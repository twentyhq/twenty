import { SettingsDiscoveryHeroCard } from '@/settings/components/SettingsDiscoveryHeroCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { t } from '@lingui/core/macro';
import {
  IconChartBar,
  IconCpu,
  IconLayoutDashboard,
  IconPlus,
  IconSparkles,
  IconTool,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { SettingsAgentSkillsTab } from '~/pages/settings/ai/components/SettingsAgentSkillsTab';
import { SettingsAgentToolsTab } from '~/pages/settings/ai/components/SettingsAgentToolsTab';
import { SettingsAiModelsTab } from '~/pages/settings/ai/components/SettingsAiModelsTab';
import { SettingsAiOverviewTab } from '~/pages/settings/ai/components/SettingsAiOverviewTab';
import { SettingsAiUsageTab } from '~/pages/settings/ai/components/SettingsAiUsageTab';
import { SETTINGS_AI_TABS } from '~/pages/settings/ai/constants/SettingsAiTabs';
import { useCreateTool } from '~/pages/settings/ai/hooks/useCreateTool';

const AI_HERO_LIGHT = '/images/ai/ai-tools-cover-light.png';
const AI_HERO_DARK = '/images/ai/ai-tools-cover-dark.png';

const SETTINGS_AI_HERO_INSTANCE_ID_PREFIX = 'settings-ai-hero';

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
    {
      id: SETTINGS_AI_TABS.TABS_IDS.USAGE,
      title: t`Usage`,
      Icon: IconChartBar,
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
  const isUsageTab = resolvedTabId === SETTINGS_AI_TABS.TABS_IDS.USAGE;

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
        <Section>
          <SettingsDiscoveryHeroCard
            lightSrc={AI_HERO_LIGHT}
            darkSrc={AI_HERO_DARK}
            instanceIdPrefix={SETTINGS_AI_HERO_INSTANCE_ID_PREFIX}
            tabs={[
              {
                id: 'skills',
                title: t`Skills`,
                Icon: IconSparkles,
                vimeoId: '1185511734',
              },
              {
                id: 'tools',
                title: t`Tools`,
                Icon: IconTool,
                vimeoId: '1185511734',
              },
              {
                id: 'models',
                title: t`Models`,
                Icon: IconCpu,
                vimeoId: '1185511734',
              },
            ]}
            playButtonAriaLabel={t`Watch AI demo`}
          />
        </Section>
        {isOverviewTab && <SettingsAiOverviewTab />}
        {isModelsTab && <SettingsAiModelsTab />}
        {isSkillsTab && <SettingsAgentSkillsTab />}
        {isToolsTab && <SettingsAgentToolsTab />}
        {isUsageTab && <SettingsAiUsageTab />}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
