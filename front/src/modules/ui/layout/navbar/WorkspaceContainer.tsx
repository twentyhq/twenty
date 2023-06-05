import styled from '@emotion/styled';

import { Workspace } from '@/workspaces/interfaces/workspace.interface';

type OwnProps = {
  workspace: Workspace;
};

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

function WorkspaceContainer({ workspace }: OwnProps) {
  return (
    <StyledContainer>
      <StyledLogo logo={workspace.logo}></StyledLogo>
      <StyledName>{workspace?.displayName}</StyledName>
    </StyledContainer>
  );
}

export default WorkspaceContainer;
