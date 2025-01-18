import { SettingsServerlessFunctionsTable } from '@/settings/serverless-functions/components/SettingsServerlessFunctionsTable';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Button, IconPlus, Section, UndecoratedLink } from 'twenty-ui';
import { settingsLink } from '~/utils/navigation/settingsLink';

export const SettingsServerlessFunctions = () => {
  return (
    <SubMenuTopBarContainer
      title="Functions"
      actionButton={
        <UndecoratedLink to={settingsLink(SettingsPath.NewServerlessFunction)}>
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
          href: settingsLink(SettingsPath.Workspace),
        },
        {
          children: 'Functions',
        },
      ]}
    >
      <Section>
        <SettingsServerlessFunctionsTable />
      </Section>
    </SubMenuTopBarContainer>
  );
};
