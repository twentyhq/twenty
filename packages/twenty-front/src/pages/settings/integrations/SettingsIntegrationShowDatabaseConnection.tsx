import { IconSettings } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsIntegrationDatabaseConnectionShowContainer } from '@/settings/integrations/database-connection/components/SettingsIntegrationDatabaseConnectionShowContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';

export const SettingsIntegrationShowDatabaseConnection = () => {
  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <SettingsIntegrationDatabaseConnectionShowContainer />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
