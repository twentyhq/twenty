import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

import { SettingsOptionCardContentButton } from '@/settings/components/SettingsOptions/SettingsOptionCardContentButton';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { t } from '@lingui/core/macro';
import {
  H2Title,
  IconFileText,
  IconSettings,
  IconSparkles,
  IconTool,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Card, Section } from 'twenty-ui/layout';
import { SettingsAIMCP } from './components/SettingsAIMCP';
import { SettingsAIRouterSettings } from './components/SettingsAIRouterSettings';
import { SettingsSkillsTable } from './components/SettingsSkillsTable';
import { SettingsToolsTable } from './components/SettingsToolsTable';
import { SETTINGS_AI_TABS } from './constants/SettingsAiTabs';

const StyledLink = styled(Link)`
  text-decoration: none;
`;

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
            <Section>
              <H2Title
                title={t`System Prompt`}
                description={t`View and customize AI instructions`}
              />
              <Card rounded>
                <SettingsOptionCardContentButton
                  Icon={IconFileText}
                  title={t`System Prompt`}
                  description={t`View the AI system prompt and add custom instructions`}
                  Button={
                    <StyledLink to={getSettingsPath(SettingsPath.AIPrompts)}>
                      <Button
                        title={t`Configure`}
                        variant="secondary"
                        size="small"
                      />
                    </StyledLink>
                  }
                />
              </Card>
            </Section>
            <SettingsAIMCP />
          </>
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
