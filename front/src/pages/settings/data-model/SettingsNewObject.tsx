import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsNewObjectType } from '@/settings/data-model/new-object/components/SettingsNewObjectType';
import { IconSettings } from '@/ui/display/icon';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

export const SettingsNewObject = () => {
  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <Breadcrumb
          links={[
            { children: 'Objects', href: '/settings/objects' },
            { children: 'New' },
          ]}
        />
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
