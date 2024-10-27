import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsIntegrationEditDatabaseConnectionContainer } from '@/settings/integrations/database-connection/components/SettingsIntegrationEditDatabaseConnectionContainer';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';

export const SettingsIntegrationEditDatabaseConnection = () => {
  return (
    <SubMenuTopBarContainer
      title="Edit connection"
      links={[
        {
          children: 'Workspace',
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        {
          children: 'Integrations',
          href: getSettingsPagePath(SettingsPath.Integrations),
        },
        { children: 'Edit connection' },
      ]}
    >
      <SettingsPageContainer>
        <SettingsIntegrationEditDatabaseConnectionContainer />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
