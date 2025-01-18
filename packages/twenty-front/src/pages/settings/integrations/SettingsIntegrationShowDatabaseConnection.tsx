import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsIntegrationDatabaseConnectionShowContainer } from '@/settings/integrations/database-connection/components/SettingsIntegrationDatabaseConnectionShowContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { settingsLink } from '~/utils/navigation/settingsLink';

export const SettingsIntegrationShowDatabaseConnection = () => {
  return (
    <SubMenuTopBarContainer
      title="Database Connection"
      links={[
        {
          children: 'Workspace',
          href: settingsLink(SettingsPath.Workspace),
        },
        {
          children: 'Integrations',
          href: settingsLink(SettingsPath.Integrations),
        },
        { children: 'Database Connection' },
      ]}
    >
      <SettingsPageContainer>
        <SettingsIntegrationDatabaseConnectionShowContainer />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
