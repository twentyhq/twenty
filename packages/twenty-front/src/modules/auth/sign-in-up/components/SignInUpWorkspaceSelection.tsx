import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { H2Title, MainButton } from 'twenty-ui';
import { availableWorkspacesForAuthState } from '@/auth/states/availableWorkspacesForAuthState';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { redirectToWorkspace } from '~/utils/workspace-url.helper';
import { HorizontalSeparator } from '@/auth/sign-in-up/components/HorizontalSeparator';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';

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
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);

  const createNewWorkspace = () => {
    console.log('>>>>>>>>>>>>>> createNewWorkspace');
  };

  return (
    <>
      <StyledContentContainer>
        {availableWorkspacesForAuth &&
          availableWorkspacesForAuth.length !== 0 && (
            <>
              <H2Title title="Choose a workspace" />
              {availableWorkspacesForAuth.map((workspace) => (
                <MainButton
                  key={workspace.id}
                  onClick={() => redirectToWorkspace(workspace.subdomain)}
                  fullWidth
                >
                  <StyledMainButtonContent>
                    <StyledIcon
                      src={workspace.logo ?? DEFAULT_WORKSPACE_LOGO}
                    />
                    <StyledDisplayName>
                      {workspace.displayName ?? workspace.id}
                    </StyledDisplayName>
                  </StyledMainButtonContent>
                </MainButton>
              ))}
            </>
          )}
        {isMultiWorkspaceEnabled && (
          <>
            {availableWorkspacesForAuth &&
              availableWorkspacesForAuth.length > 0 && (
                <HorizontalSeparator text="Or" />
              )}
            <MainButton onClick={() => createNewWorkspace()} fullWidth>
              <StyledMainButtonContent>
                <StyledIcon src={DEFAULT_WORKSPACE_LOGO} />
                <StyledDisplayName>Create workspace</StyledDisplayName>
              </StyledMainButtonContent>
            </MainButton>
          </>
        )}
      </StyledContentContainer>
    </>
  );
};
