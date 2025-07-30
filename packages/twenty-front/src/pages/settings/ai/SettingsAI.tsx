import { useLingui } from '@lingui/react/macro';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { H2Title, IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { SettingsAIAgentsTable } from './components/SettingsAIAgentsTable';
import { DUMMY_AI_AGENTS } from './data/dummyAIAgents';

export const SettingsAI = () => {
  const { t } = useLingui();

  return (
    <SubMenuTopBarContainer
      title={t`AI`}
      actionButton={
        <UndecoratedLink to={getSettingsPath(SettingsPath.NewAgent)}>
          <Button
            Icon={IconPlus}
            title={t`New Agent`}
            accent="blue"
            size="small"
          />
        </UndecoratedLink>
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
          <H2Title
            title={t`Agents`}
            description={t`Agents used to route queries to specialized agents`}
          />
          <SettingsAIAgentsTable agents={DUMMY_AI_AGENTS} />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
