import { IconSettings } from 'twenty-ui';

import { InformationBanner } from '@/object-record/information-banner/InformationBanner';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsIntegrationGroup } from '@/settings/integrations/components/SettingsIntegrationGroup';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

export const SettingsIntegrations = () => {
  const integrationCategories = useSettingsIntegrationCategories();

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <InformationBanner />
      <SettingsPageContainer>
        <Breadcrumb links={[{ children: 'Integrations' }]} />
        {integrationCategories.map((group) => (
          <SettingsIntegrationGroup key={group.key} integrationGroup={group} />
        ))}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
