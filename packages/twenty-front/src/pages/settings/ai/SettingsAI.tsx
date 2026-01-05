import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { t } from '@lingui/core/macro';
import { IconSettings, IconSparkles, IconTool } from 'twenty-ui/display';
import { SettingsAIMCP } from './components/SettingsAIMCP';
import { SettingsAIRouterSettings } from './components/SettingsAIRouterSettings';
import { SettingsSkillsTable } from './components/SettingsSkillsTable';
import { SettingsToolsTable } from './components/SettingsToolsTable';
import { SETTINGS_AI_TABS } from './constants/SettingsAiTabs';

export const SettingsAI = () => {
  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    SETTINGS_AI_TABS.COMPONENT_INSTANCE_ID,
  );

  const tabs = [
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
      id: SETTINGS_AI_TABS.TABS_IDS.SETTINGS,
      title: t`Settings`,
      Icon: IconSettings,
    },
  ];

  const isSkillsTab = activeTabId === SETTINGS_AI_TABS.TABS_IDS.SKILLS;
  const isToolsTab = activeTabId === SETTINGS_AI_TABS.TABS_IDS.TOOLS;
  const isSettingsTab = activeTabId === SETTINGS_AI_TABS.TABS_IDS.SETTINGS;

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
        {isSkillsTab && <SettingsSkillsTable />}
        {isToolsTab && <SettingsToolsTable />}
        {isSettingsTab && (
          <>
            <SettingsAIRouterSettings />
            <SettingsAIMCP />
          </>
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
