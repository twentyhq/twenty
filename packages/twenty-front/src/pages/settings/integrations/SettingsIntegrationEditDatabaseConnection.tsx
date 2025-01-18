import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsIntegrationEditDatabaseConnectionContainer } from '@/settings/integrations/database-connection/components/SettingsIntegrationEditDatabaseConnectionContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { settingsLink } from '~/utils/navigation/settingsLink';

export const SettingsIntegrationEditDatabaseConnection = () => {
  return (
    <SubMenuTopBarContainer
      title="Edit connection"
      links={[
        {
          children: 'Workspace',
          href: settingsLink(SettingsPath.Workspace),
        },
        {
          children: 'Integrations',
          href: settingsLink(SettingsPath.Integrations),
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
