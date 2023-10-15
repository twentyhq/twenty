import styled from '@emotion/styled';

import { NewObjectType } from '@/settings/objects/components/NewObjectType';
import { objectSettingsWidth } from '@/settings/objects/constants/objectSettings';
import { IconSettings } from '@/ui/display/icon';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

const StyledContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  height: fit-content;
  padding: ${({ theme }) => theme.spacing(8)};
  width: ${objectSettingsWidth};
`;

export const SettingsNewObject = () => {
  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <StyledContainer>
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
        </Section>
        <NewObjectType></NewObjectType>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
