import { useNavigate } from 'react-router-dom';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsNewObjectType } from '@/settings/data-model/new-object/components/SettingsNewObjectType';
import { IconSettings } from '@/ui/display/icon';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

export const SettingsNewObject = () => {
  const navigate = useNavigate();
  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <SettingsHeaderContainer>
          <Breadcrumb
            links={[
              { children: 'Objects', href: '/settings/objects' },
              { children: 'New' },
            ]}
          />
          <SaveAndCancelButtons
            isSaveDisabled
            onCancel={() => {
              navigate('/settings/objects');
            }}
            onSave={() => {}}
          />
        </SettingsHeaderContainer>
        <Section>
          <H2Title
            title="Object Type"
            description="The type of object you want to add"
          />
          <SettingsNewObjectType />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
