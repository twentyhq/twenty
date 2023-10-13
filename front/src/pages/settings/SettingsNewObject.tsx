import styled from '@emotion/styled';

import { IconSettings } from '@/ui/Display/Icon';
import { SubMenuTopBarContainer } from '@/ui/Layout/Page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/Navigation/Breadcrumb/components/Breadcrumb';

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
    </StyledContainer>
  </SubMenuTopBarContainer>
);
