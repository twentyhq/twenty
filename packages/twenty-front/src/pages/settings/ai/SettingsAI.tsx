import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { H2Title, IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { useFindManyAgentsQuery } from '~/generated-metadata/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

import { t } from '@lingui/core/macro';
import { SettingsAIAgentsTable } from './components/SettingsAIAgentsTable';

export const SettingsAI = () => {
  const { data } = useFindManyAgentsQuery();

  return (
    <SubMenuTopBarContainer
      title={t`AI`}
      actionButton={
        <UndecoratedLink to={getSettingsPath(SettingsPath.AINewAgent)}>
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
          <SettingsAIAgentsTable agents={data?.findManyAgents || []} />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
