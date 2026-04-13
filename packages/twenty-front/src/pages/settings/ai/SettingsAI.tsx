import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { usePersistLogicFunction } from '@/logic-functions/hooks/usePersistLogicFunction';
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
  IconPlus,
  IconSettingsBolt,
  IconSparkles,
  IconTool,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { SettingsAIMoreTab } from '~/pages/settings/ai/components/SettingsAIMoreTab';
import { SettingsAgentToolsTab } from '~/pages/settings/ai/components/SettingsAgentToolsTab';
import { SettingsAIModelsTab } from './components/SettingsAIModelsTab';
import { SettingsAIUsageTab } from './components/SettingsAIUsageTab';
import { SettingsAgentSkills } from './components/SettingsAgentSkills';
import { SETTINGS_AI_TABS } from './constants/SettingsAiTabs';

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
          isTool: true,
        },
      });

      if (result.status === 'successful' && isDefined(result.response?.data)) {
        const newLogicFunction = result.response.data.createOneLogicFunction;
        enqueueSuccessSnackBar({ message: t`Tool created` });

        const applicationId = (newLogicFunction as { applicationId?: string })
          .applicationId;
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
      actionButton={
        isSkillsTab ? (
          <UndecoratedLink to={getSettingsPath(SettingsPath.AINewSkill)}>
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
        <TabList
          tabs={tabs}
          componentInstanceId={SETTINGS_AI_TABS.COMPONENT_INSTANCE_ID}
        />
        {isModelsTab && <SettingsAIModelsTab />}
        {isSkillsTab && <SettingsAgentSkills />}
        {isToolsTab && <SettingsAgentToolsTab />}
        {isUsageTab && <SettingsAIUsageTab />}
        {isMoreTab && <SettingsAIMoreTab />}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
