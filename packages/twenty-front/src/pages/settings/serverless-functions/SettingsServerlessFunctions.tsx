import { SettingsServerlessFunctionsTable } from '@/settings/serverless-functions/components/SettingsServerlessFunctionsTable';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { useGetManyServerlessFunctions } from '@/settings/serverless-functions/hooks/useGetManyServerlessFunctions';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';

export const SettingsServerlessFunctions = () => {
  const { serverlessFunctions } = useGetManyServerlessFunctions();

  return (
    <SubMenuTopBarContainer
      title="Functions"
      actionButton={
        <UndecoratedLink
          to={getSettingsPath(SettingsPath.NewServerlessFunction)}
        >
          <Button
            Icon={IconPlus}
            title="New Function"
            accent="blue"
            size="small"
          />
        </UndecoratedLink>
      }
      links={[
        {
          children: 'Workspace',
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: 'Functions',
        },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <SettingsServerlessFunctionsTable
            serverlessFunctions={serverlessFunctions}
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
