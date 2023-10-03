import styled from '@emotion/styled';

import { IconSettings } from '@/ui/icon';
import { SubMenuTopBarContainer } from '@/ui/layout/components/SubMenuTopBarContainer';
import { H1Title } from '@/ui/typography/components/H1Title';

const StyledContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(8)};
  width: 350px;
`;

export const SettingsObjects = () => (
  <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
    <StyledContainer>
      <H1Title title="Objects" />
    </StyledContainer>
  </SubMenuTopBarContainer>
);
