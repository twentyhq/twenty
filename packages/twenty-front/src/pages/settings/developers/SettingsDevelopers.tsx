import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { IconSettings } from '@/ui/display/icon';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { SettingsDevelopersApiKeys } from '~/pages/settings/developers/api-keys/SettingsDevelopersApiKeys';
import { SettingsDevelopersWebhooks } from '~/pages/settings/developers/webhooks/SettingsDevelopersWebhooks';

import { ReadDocumentationButton } from './components/ReadDocumentationButton';

export const SettingsDevelopers = () => {
  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <SettingsHeaderContainer>
          <Breadcrumb links={[{ children: 'Developers' }]} />
          <ReadDocumentationButton />
        </SettingsHeaderContainer>
        <SettingsDevelopersApiKeys />
        <SettingsDevelopersWebhooks />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
