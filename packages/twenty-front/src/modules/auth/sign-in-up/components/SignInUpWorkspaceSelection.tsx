import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { H2Title, MainButton } from 'twenty-ui';
import { availableWorkspacesForAuthState } from '@/auth/states/availableWorkspacesForAuthState';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { redirectToWorkspace } from '~/utils/workspace-url.helper';

const StyledContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledMainButtonContent = styled.div`
  display: flex;
  width: calc(100% + ${({ theme }) => theme.spacing(4)});
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledIcon = styled.img<{ src: string }>`
  background-image: url(${(props) => props.src});
  height: ${({ theme }) => theme.spacing(4)};
  width: ${({ theme }) => theme.spacing(4)};
  border-radius: 4px;
`;

const StyledDisplayName = styled.span`
  flex-grow: 1;
  text-align: center;
  margin-right: ${({ theme }) => theme.spacing(8)};
`;

export const SignInUpWorkspaceSelection = () => {
  const availableWorkspacesForAuth = useRecoilValue(
    availableWorkspacesForAuthState,
  );

  return (
    <>
      <H2Title title="Select a workspace" />
      <StyledContentContainer>
        {availableWorkspacesForAuth &&
          availableWorkspacesForAuth.length !== 0 &&
          availableWorkspacesForAuth.map((workspace) => (
            <MainButton
              onClick={() => redirectToWorkspace(workspace.subdomain)}
              fullWidth
            >
              <StyledMainButtonContent>
                <StyledIcon src={workspace.logo ?? DEFAULT_WORKSPACE_LOGO} />
                <StyledDisplayName>
                  {workspace.displayName ?? workspace.id}
                </StyledDisplayName>
              </StyledMainButtonContent>
            </MainButton>
          ))}
      </StyledContentContainer>
    </>
  );
};
