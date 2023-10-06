import styled from '@emotion/styled';

import { IconSettings } from '@/ui/icon';
import { SubMenuTopBarContainer } from '@/ui/layout/components/SubMenuTopBarContainer';

const StyledContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(8)};
  width: 512px;
`;

export const SettingsObjectDetail = () => (
  <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
    <StyledContainer />
  </SubMenuTopBarContainer>
);
