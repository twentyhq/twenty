import styled from '@emotion/styled';

import { objectSettingsWidth } from '@/settings/objects/constants/objectSettings';
import { Breadcrumb } from '@/ui/breadcrumb/components/Breadcrumb';
import { IconSettings } from '@/ui/icon';
import { SubMenuTopBarContainer } from '@/ui/layout/components/SubMenuTopBarContainer';

const StyledContainer = styled.div`
  height: fit-content;
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
    </StyledContainer>
  </SubMenuTopBarContainer>
);
