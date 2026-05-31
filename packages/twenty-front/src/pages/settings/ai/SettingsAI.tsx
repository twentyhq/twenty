import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { usePersistLogicFunction } from '@/logic-functions/hooks/usePersistLogicFunction';
import { SettingsDiscoveryHeroCard } from '@/settings/components/SettingsDiscoveryHeroCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

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

const AI_HERO_LIGHT = '/images/ai/ai-tools-cover-light.png';
const AI_HERO_DARK = '/images/ai/ai-tools-cover-dark.png';

const SETTINGS_AI_HERO_INSTANCE_ID_PREFIX = 'settings-ai-hero';

export const SettingsAI = () => {
  const navigate = useNavigate();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { createLogicFunction } = usePersistLogicFunction();
  const [isCreatingTool, setIsCreatingTool] = useState(false);

  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    SETTINGS_AI_TABS.COMPONENT_INSTANCE_ID,
  );

  const handleCreateTool = async () => {
    setIsCreatingTool(true);
    try {
      const result = await createLogicFunction({
        input: {
          name: 'new-tool',
          toolTriggerSettings: {
            inputSchema: { type: 'object', properties: {} },
          },
        },
      });

      if (result.status === 'successful' && isDefined(result.response?.data)) {
        const newLogicFunction = result.response.data.createOneLogicFunction;
        enqueueSuccessSnackBar({ message: t`Tool created` });

        const applicationId = newLogicFunction.applicationId;
        if (isDefined(applicationId)) {
          navigate(
            getSettingsPath(SettingsPath.ApplicationLogicFunctionDetail, {
              applicationId,
              logicFunctionId: newLogicFunction.id,
            }),
          );
        } else {
          navigate(
            getSettingsPath(SettingsPath.LogicFunctionDetail, {
              logicFunctionId: newLogicFunction.id,
            }),
          );
        }
      } else {
        enqueueErrorSnackBar({ message: t`Failed to create tool` });
      }
    } finally {
      setIsCreatingTool(false);
    }
  };

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

  const resolvedTabId = activeTabId ?? SETTINGS_AI_TABS.TABS_IDS.OVERVIEW;
  const isOverviewTab = resolvedTabId === SETTINGS_AI_TABS.TABS_IDS.OVERVIEW;
  const isModelsTab = resolvedTabId === SETTINGS_AI_TABS.TABS_IDS.MODELS;
  const isSkillsTab = resolvedTabId === SETTINGS_AI_TABS.TABS_IDS.SKILLS;
  const isToolsTab = resolvedTabId === SETTINGS_AI_TABS.TABS_IDS.TOOLS;
  const isUsageTab = resolvedTabId === SETTINGS_AI_TABS.TABS_IDS.USAGE;

  return (
    <SubMenuTopBarContainer
      title={t`AI`}
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
          href: getSettingsPath(SettingsPath.Workspace),
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
        <TabList
          tabs={tabs}
          componentInstanceId={SETTINGS_AI_TABS.COMPONENT_INSTANCE_ID}
        />
        {isOverviewTab && <SettingsAiOverviewTab />}
        {isModelsTab && <SettingsAiModelsTab />}
        {isSkillsTab && <SettingsAgentSkillsTab />}
        {isToolsTab && <SettingsAgentToolsTab />}
        {isUsageTab && <SettingsAiUsageTab />}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
