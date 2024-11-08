/* @license Enterprise */

import { HorizontalSeparator } from '@/auth/sign-in-up/components/HorizontalSeparator';
import { useSSO } from '@/auth/sign-in-up/hooks/useSSO';
import { guessSSOIdentityProviderIconByUrl } from '@/settings/security/utils/guessSSOIdentityProviderIconByUrl';
import { DEFAULT_WORKSPACE_NAME } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceName';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { AnimatedEaseIn, MainButton } from 'twenty-ui';
import { Logo } from '@/auth/components/Logo';
import { Title } from '@/auth/components/Title';
import { availableWorkspacesForAuthState } from '@/auth/states/availableWorkspacesForAuthState';

const StyledContentContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledTitle = styled.h2`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: 0;
`;

export const SignInUpWorkspaceSelection = () => {
  const availableWorkspacesForAuth = useRecoilValue(
    availableWorkspacesForAuthState,
  );

  const { redirectToSSOLoginPage } = useSSO();

  return (
    <>
      <AnimatedEaseIn>
        <Logo />
      </AnimatedEaseIn>
      <Title animate>Welcome to Twenty</Title>
      <StyledContentContainer>
        {availableWorkspacesForAuth &&
          availableWorkspacesForAuth.length !== 0 &&
          availableWorkspacesForAuth.map((workspace) => (
            <>
              <StyledTitle>
                {workspace.displayName ?? DEFAULT_WORKSPACE_NAME}
              </StyledTitle>
              <HorizontalSeparator visible={false} />
              {workspace.sso &&
                workspace.sso.length !== 0 &&
                workspace.sso.map((idp) => (
                  <>
                    <MainButton
                      title={idp.name}
                      onClick={() => redirectToSSOLoginPage(idp.id)}
                      Icon={guessSSOIdentityProviderIconByUrl(idp.issuer)}
                      fullWidth
                    />
                    <HorizontalSeparator visible={false} />
                  </>
                ))}
            </>
          ))}
      </StyledContentContainer>
    </>
  );
};
