import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { IconSettings } from '@/ui/display/icon';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { SettingsIntegrationGroup } from '~/pages/settings/integrations/SettingsIntegrationGroup';

import integrationCategories from './constants/Integrations';

export const SettingsIntegrations = () => {
  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <Breadcrumb links={[{ children: 'Integrations' }]} />
        {integrationCategories.map((group) => {
          return <SettingsIntegrationGroup integrationGroup={group} />;
        })}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
