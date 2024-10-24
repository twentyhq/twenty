/* @license Enterprise */

import { FooterNote } from '@/auth/sign-in-up/components/FooterNote';
import { HorizontalSeparator } from '@/auth/sign-in-up/components/HorizontalSeparator';
import { useSSO } from '@/auth/sign-in-up/hooks/useSSO';
import { availableSSOIdentityProvidersState } from '@/auth/states/availableWorkspacesForSSO';
import { guessSSOIdentityProviderIconByUrl } from '@/settings/security/utils/guessSSOIdentityProviderIconByUrl';
import { DEFAULT_WORKSPACE_NAME } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceName';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { MainButton } from 'twenty-ui';

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
                    Icon={guessSSOIdentityProviderIconByUrl(idp.issuer)}
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
