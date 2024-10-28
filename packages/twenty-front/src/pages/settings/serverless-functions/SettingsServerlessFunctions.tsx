import { SettingsServerlessFunctionsTable } from '@/settings/serverless-functions/components/SettingsServerlessFunctionsTable';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Button, IconPlus, Section, UndecoratedLink } from 'twenty-ui';

export const SettingsServerlessFunctions = () => {
  return (
    <SubMenuTopBarContainer
      title="Functions"
      actionButton={
        <UndecoratedLink
          to={getSettingsPagePath(SettingsPath.NewServerlessFunction)}
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
          href: getSettingsPagePath(SettingsPath.Workspace),
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
