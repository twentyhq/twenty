import { useRecoilValue } from 'recoil';
import { availableSSOIdentityProvidersState } from '@/auth/states/availableWorkspacesForSSO';
import styled from '@emotion/styled';
import { MainButton } from '@/ui/input/button/components/MainButton';
import { guessIconByUrl } from '@/settings/security/utils/guessIconByUrl';
import { HorizontalSeparator } from '@/auth/sign-in-up/components/HorizontalSeparator';
import { FooterNote } from '@/auth/sign-in-up/components/FooterNote';
import { DEFAULT_WORKSPACE_NAME } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceName';
import { useSSO } from '@/auth/sign-in-up/hooks/useSSO';

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

export const SSOWorkspaceSelection = () => {
  const availableSSOIdentityProviders = useRecoilValue(
    availableSSOIdentityProvidersState,
  );

  const { redirectToSSOLoginPage } = useSSO();

  const availableWorkspacesForSSOGroupByWorkspace =
    availableSSOIdentityProviders.reduce(
      (acc, idp) => {
        acc[idp.workspace.id] = [...(acc[idp.workspace.id] ?? []), idp];
        return acc;
      },
      {} as Record<string, typeof availableSSOIdentityProviders>,
    );

  return (
    <>
      <StyledContentContainer>
        {Object.values(availableWorkspacesForSSOGroupByWorkspace).map(
          (idps) => (
            <>
              <StyledTitle>
                {idps[0].workspace.displayName ?? DEFAULT_WORKSPACE_NAME}
              </StyledTitle>
              <HorizontalSeparator visible={false} />
              {idps.map((idp) => (
                <>
                  <MainButton
                    title={idp.name}
                    onClick={() => redirectToSSOLoginPage(idp.id)}
                    Icon={guessIconByUrl(idp.issuer)}
                    fullWidth
                  />
                  <HorizontalSeparator visible={false} />
                </>
              ))}
            </>
          ),
        )}
      </StyledContentContainer>
      <FooterNote />
    </>
  );
};
