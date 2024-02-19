import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { IconSettings } from '@/ui/display/icon';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { SETTINGS_INTEGRATION_CATEGORIES } from '~/pages/settings/integrations/constants/SettingsIntegrationCategories';
import { SettingsIntegrationGroup } from '~/pages/settings/integrations/SettingsIntegrationGroup';

export const SettingsIntegrations = () => {
  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <Breadcrumb links={[{ children: 'Integrations' }]} />
        {SETTINGS_INTEGRATION_CATEGORIES.map((group) => {
          return <SettingsIntegrationGroup integrationGroup={group} />;
        })}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
