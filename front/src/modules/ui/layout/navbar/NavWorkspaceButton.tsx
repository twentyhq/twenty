import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';

import NavCollapseButton from './NavCollapseButton';

const StyledContainer = styled.div`
  align-items: center;
  align-self: flex-start;
  background: inherit;
  border: 0;
  display: flex;
  height: 34px;
  justify-content: space-between;
  margin-left: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(1)};
  user-select: none;
  width: 100%;
`;

const LogoAndNameContainer = styled.div`
  align-items: center;
  display: flex;
`;

type StyledLogoProps = {
  logo?: string | null;
};

const StyledLogo = styled.div<StyledLogoProps>`
  background: url(${(props) => props.logo});
  background-size: cover;
  border-radius: 2px;
  height: 16px;
  width: 16px;
`;

const StyledName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-family: 'Inter';
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: 500;
  margin-left: ${({ theme }) => theme.spacing(1)};
`;

function NavWorkspaceButton() {
  const currentUser = useRecoilValue(currentUserState);

  const currentWorkspace = currentUser?.workspaceMember?.workspace;

  if (!currentWorkspace) {
    return null;
  }

  return (
    <StyledContainer>
      <LogoAndNameContainer>
        <StyledLogo logo={currentWorkspace?.logo}></StyledLogo>
        <StyledName>{currentWorkspace?.displayName}</StyledName>
      </LogoAndNameContainer>
      <NavCollapseButton />
    </StyledContainer>
  );
}

export default NavWorkspaceButton;
