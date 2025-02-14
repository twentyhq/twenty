/* @license Enterprise */

import { useSSO } from '@/auth/sign-in-up/hooks/useSSO';
import { guessSSOIdentityProviderIconByUrl } from '@/settings/security/utils/guessSSOIdentityProviderIconByUrl';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { HorizontalSeparator, MainButton } from 'twenty-ui';

import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';
import { isDefined } from 'twenty-shared';
import React from 'react';

const StyledContentContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

export const SignInUpSSOIdentityProviderSelection = () => {
  const workspaceAuthProviders = useRecoilValue(workspaceAuthProvidersState);

  const { redirectToSSOLoginPage } = useSSO();

  return (
    <>
      <StyledContentContainer>
        {isDefined(workspaceAuthProviders?.sso) &&
          workspaceAuthProviders?.sso.map((idp) => (
            <React.Fragment key={idp.id}>
              <MainButton
                title={idp.name}
                onClick={() => redirectToSSOLoginPage(idp.id)}
                Icon={guessSSOIdentityProviderIconByUrl(idp.issuer)}
                fullWidth
              />
              <HorizontalSeparator visible={false} />
            </React.Fragment>
          ))}
      </StyledContentContainer>
    </>
  );
};
