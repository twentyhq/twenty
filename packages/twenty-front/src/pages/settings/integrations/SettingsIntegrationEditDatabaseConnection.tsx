import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsIntegrationEditDatabaseConnectionContainer } from '@/settings/integrations/database-connection/components/SettingsIntegrationEditDatabaseConnectionContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsIntegrationEditDatabaseConnection = () => {
  return (
    <SubMenuTopBarContainer
      title="Edit connection"
      links={[
        {
          children: 'Workspace',
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: 'Integrations',
          href: getSettingsPath(SettingsPath.Integrations),
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
