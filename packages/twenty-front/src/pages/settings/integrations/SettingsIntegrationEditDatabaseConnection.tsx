import { IconSettings } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsIntegrationEditDatabaseConnectionContainer } from '@/settings/integrations/database-connection/components/SettingsIntegrationEditDatabaseConnectionContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

export const SettingsIntegrationEditDatabaseConnection = () => {
  return (
    <SubMenuTopBarContainer
      Icon={IconSettings}
      title={
        <Breadcrumb
          links={[
            // TODO
            { children: 'Edit connection' },
          ]}
        />
      }
    >
      <SettingsPageContainer>
        <SettingsIntegrationEditDatabaseConnectionContainer />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
