import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';

const StyledContainer = styled.button`
  display: inline-flex;
  height: 34px;
  align-items: center;
  cursor: pointer;
  user-select: none;
  border: 0;
  background: inherit;
  padding: ${(props) => props.theme.spacing(2)};
  margin-left: ${(props) => props.theme.spacing(1)};
  align-self: flex-start;
`;

type StyledLogoProps = {
  logo?: string | null;
};

const StyledLogo = styled.div<StyledLogoProps>`
  background: url(${(props) => props.logo});
  background-size: cover;
  width: 16px;
  height: 16px;
  border-radius: 2px;
`;

const StyledName = styled.div`
  margin-left: ${(props) => props.theme.spacing(1)};
  font-family: 'Inter';
  font-weight: 500;
  font-size: ${(props) => props.theme.fontSizeLarge};
  color: ${(props) => props.theme.text80};
`;

function WorkspaceContainer() {
  const currentUser = useRecoilValue(currentUserState);

  const currentWorkspace = currentUser?.workspaceMember?.workspace;

  if (!currentWorkspace) {
    return null;
  }

  return (
    <StyledContainer>
      <StyledLogo logo={currentWorkspace?.logo}></StyledLogo>
      <StyledName>{currentWorkspace?.displayName}</StyledName>
    </StyledContainer>
  );
}

export default WorkspaceContainer;
