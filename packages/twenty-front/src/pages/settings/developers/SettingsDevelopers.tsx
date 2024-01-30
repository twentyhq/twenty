import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { IconSettings } from '@/ui/display/icon';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { SettingsDevelopersApiKeys } from '~/pages/settings/developers/SettingsDevelopersApiKeys';
import { SettingsDevelopersWebhooks } from '~/pages/settings/developers/SettingsDevelopersWebhooks';

export const SettingsDevelopers = () => {
  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <Breadcrumb links={[{ children: 'Developers' }]} />
        <SettingsDevelopersApiKeys />
        <SettingsDevelopersWebhooks />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
