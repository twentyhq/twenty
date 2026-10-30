import { NavigationButton } from '@/ui/input/components/NavigationButton';

import { SettingsDiscoveryHeroCard } from '@/settings/components/SettingsDiscoveryHeroCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { t } from '@lingui/core/macro';
import { Section } from 'twenty-ui/components/layout';
import {
  IconBook,
  IconChartBar,
  IconCpu,
  IconLayoutDashboard,
  IconPlus,
  IconSparkle2,
  IconSparkles,
  IconTool,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { SettingsAgentSkillsTab } from '~/pages/settings/ai/components/SettingsAgentSkillsTab';
import { SettingsAgentToolsTab } from '~/pages/settings/ai/components/SettingsAgentToolsTab';
import { SettingsAiModelsTab } from '~/pages/settings/ai/components/SettingsAiModelsTab';
import { SettingsAiUsageTab } from '~/pages/settings/ai/components/SettingsAiUsageTab';
import { SETTINGS_AI_TABS } from '@/settings/ai/constants/SettingsAiTabs';
import McpCoverDark from '@/settings/mcp/assets/mcp-cover-dark.png';
import McpCoverLight from '@/settings/mcp/assets/mcp-cover-light.png';
import { SettingsMcpSetup } from '@/settings/mcp/components/SettingsMcpSetup';
import { useCreateTool } from '~/pages/settings/ai/hooks/useCreateTool';
import { SettingsAiOverview } from '~/pages/settings/ai/components/SettingsAiOverview';
import { SettingsAiMcpSection } from '~/pages/settings/ai/components/SettingsAiMcpSection';
import { SettingsAiWorkspaceInstructionsSection } from '~/pages/settings/ai/components/SettingsAiWorkspaceInstructionsSection';
import { SettingsAiSystemPromptsSection } from '~/pages/settings/ai/components/SettingsAiSystemPromptsSection';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

const AI_HERO_LIGHT = '/images/ai/ai-tools-cover-light.png';
const AI_HERO_DARK = '/images/ai/ai-tools-cover-dark.png';

const SETTINGS_AI_HERO_INSTANCE_ID_PREFIX = 'settings-ai-hero';

export const SettingsAI = () => {
  const { handleCreateTool, isCreatingTool } = useCreateTool();
  const canReadSystemPrompts = useHasPermissionFlag(PermissionFlagType.AI);
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

  const resolvedTabId =
    useSettingsActiveTabId(
      SETTINGS_AI_TABS.COMPONENT_INSTANCE_ID,
      tabs.map((tab) => tab.id),
    ) ??
    (isInboxEnabled
      ? SETTINGS_AI_TABS.TABS_IDS.OVERVIEW
      : SETTINGS_AI_TABS.TABS_IDS.MCP);
  const isOverviewTab =
    isInboxEnabled && resolvedTabId === SETTINGS_AI_TABS.TABS_IDS.OVERVIEW;
  const isMcpTab = resolvedTabId === SETTINGS_AI_TABS.TABS_IDS.MCP;
  const isModelsTab = resolvedTabId === SETTINGS_AI_TABS.TABS_IDS.MODELS;
  const isSkillsTab = resolvedTabId === SETTINGS_AI_TABS.TABS_IDS.SKILLS;
  const isToolsTab = resolvedTabId === SETTINGS_AI_TABS.TABS_IDS.TOOLS;
  const isUsageTab = resolvedTabId === SETTINGS_AI_TABS.TABS_IDS.USAGE;

  const secondaryBar = (
    <SettingsTabBar
      aria-label={t`AI settings`}
      tabs={tabs}
      componentInstanceId={SETTINGS_AI_TABS.COMPONENT_INSTANCE_ID}
    />
  );

  if (isOverviewTab) {
    return (
      <SettingsAiOverview
        secondaryBar={secondaryBar}
        mcpSection={<SettingsAiMcpSection />}
        workspaceInstructionsSection={
          <SettingsAiWorkspaceInstructionsSection />
        }
        systemPromptSection={
          canReadSystemPrompts ? <SettingsAiSystemPromptsSection /> : null
        }
      />
    );
  }

  return (
    <SettingsPageLayout
      title={t`AI`}
      secondaryBar={secondaryBar}
      actionButton={
        isSkillsTab ? (
          <NavigationButton
            to={getSettingsPath(SettingsPath.AiNewSkill)}
            startIcon={<IconPlus />}
            size="sm"
            variant="solid"
            color="accent"
          >{t`New Skill`}</NavigationButton>
        ) : isToolsTab ? (
          <Button
            startIcon={<IconPlus />}
            size="sm"
            onClick={handleCreateTool}
            disabled={isCreatingTool}
            variant="solid"
            color="accent"
          >{t`New Tool`}</Button>
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
        {isMcpTab && (
          <>
            <Section.Root>
              <SettingsDiscoveryHeroCard
                lightSrc={McpCoverLight}
                darkSrc={McpCoverDark}
                instanceIdPrefix={SETTINGS_AI_HERO_INSTANCE_ID_PREFIX}
                tabs={[]}
              />
            </Section.Root>
            <SettingsMcpSetup />
          </>
        )}
        {(isSkillsTab || isToolsTab || isUsageTab) && (
          <Section.Root>
            <SettingsDiscoveryHeroCard
              lightSrc={AI_HERO_LIGHT}
              darkSrc={AI_HERO_DARK}
              instanceIdPrefix={SETTINGS_AI_HERO_INSTANCE_ID_PREFIX}
              tabs={[
                {
                  id: 'ai_walkthrough',
                  title: t`Walkthrough`,
                  Icon: IconSparkle2,
                  vimeoId: '1217964358',
                  hasSound: true,
                },
              ]}
              playButtonAriaLabel={t`Watch AI demo`}
            />
          </Section.Root>
        )}
        {isModelsTab && <SettingsAiModelsTab />}
        {isSkillsTab && <SettingsAgentSkillsTab />}
        {isToolsTab && <SettingsAgentToolsTab />}
        {isUsageTab && <SettingsAiUsageTab />}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
