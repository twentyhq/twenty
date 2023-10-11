import styled from '@emotion/styled';

import { Breadcrumb } from '@/ui/breadcrumb/components/Breadcrumb';
import { IconSettings } from '@/ui/icon';
import { IconSection } from '@/ui/icon-section/components/IconSection';
import { SubMenuTopBarContainer } from '@/ui/layout/components/SubMenuTopBarContainer';

import { objectSettingsWidth } from './constants/objectSettings';

const StyledContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(8)};
  width: ${objectSettingsWidth};
`;

export const SettingsNewObject = () => (
  <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
    <StyledContainer>
      <Breadcrumb
        links={[
          { children: 'Objects', href: '/settings/objects' },
          { children: 'New' },
        ]}
      />
      <IconSection />
    </StyledContainer>
  </SubMenuTopBarContainer>
);
