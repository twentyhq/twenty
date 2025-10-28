import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  IconPlus,
  IconRobot,
  IconServer,
  IconSettings,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { UndecoratedLink } from 'twenty-ui/navigation';

import { t } from '@lingui/core/macro';
import { SettingsAIAgentsTable } from './components/SettingsAIAgentsTable';
import { SettingsAIMCP } from './components/SettingsAIMCP';
import { SettingsAIRouterSettings } from './components/SettingsAIRouterSettings';

const SETTINGS_AI_TABS_ID = 'settings-ai-tabs-id';

const SETTINGS_AI_TABS = {
  AGENTS: 'agents',
  SETTINGS: 'settings',
  MCP: 'mcp',
};

export const SettingsAI = () => {
  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    SETTINGS_AI_TABS_ID,
  );

  const tabs = [
    {
      id: SETTINGS_AI_TABS.AGENTS,
      title: t`Agents`,
      Icon: IconRobot,
    },
    {
      id: SETTINGS_AI_TABS.MCP,
      title: t`MCP`,
      Icon: IconServer,
    },
    {
      id: SETTINGS_AI_TABS.SETTINGS,
      title: t`Settings`,
      Icon: IconSettings,
    },
  ];

  const renderActiveTabContent = () => {
    switch (activeTabId) {
      case SETTINGS_AI_TABS.AGENTS:
        return <SettingsAIAgentsTable />;
      case SETTINGS_AI_TABS.SETTINGS:
        return <SettingsAIRouterSettings />;
      case SETTINGS_AI_TABS.MCP:
        return <SettingsAIMCP />;
    }
  };

  return (
    <SubMenuTopBarContainer
      title={t`AI`}
      actionButton={
        activeTabId === SETTINGS_AI_TABS.AGENTS ? (
          <UndecoratedLink to={getSettingsPath(SettingsPath.AINewAgent)}>
            <Button
              Icon={IconPlus}
              title={t`New Agent`}
              accent="blue"
              size="small"
            />
          </UndecoratedLink>
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
        <TabList tabs={tabs} componentInstanceId={SETTINGS_AI_TABS_ID} />
        {renderActiveTabContent()}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
