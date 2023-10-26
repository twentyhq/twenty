import { useParams } from 'react-router-dom';

import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { IconSettings } from '@/ui/display/icon';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

export const SettingsObjectFieldEdit = () => {
  const { objectSlug = '', fieldName = '' } = useParams();
  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <SettingsHeaderContainer>
          <Breadcrumb
            links={[
              { children: 'Objects', href: '/settings/objects' },
              {
                children: `${objectSlug}`,
                href: `/settings/objects/${objectSlug}`,
              },
              {
                children: `${fieldName}`,
              },
            ]}
          />
        </SettingsHeaderContainer>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
