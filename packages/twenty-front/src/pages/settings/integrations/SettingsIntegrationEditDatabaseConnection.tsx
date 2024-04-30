import { IconSettings } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsIntegrationEditDatabaseConnectionContainer } from '@/settings/integrations/database-connection/components/SettingsIntegrationEditDatabaseConnectionContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';

export const SettingsIntegrationEditDatabaseConnection = () => {
  return (
    <>
      <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
        <SettingsPageContainer>
          <SettingsIntegrationEditDatabaseConnectionContainer />
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </>
  );
};
