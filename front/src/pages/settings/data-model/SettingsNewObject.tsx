import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsNewObjectType } from '@/settings/data-model/new-object/components/SettingsNewObjectType';
import { IconSettings } from '@/ui/display/icon';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export const SettingsNewObject = () => {
  const navigate = useNavigate();
  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <StyledContainer>
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
        </StyledContainer>
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
