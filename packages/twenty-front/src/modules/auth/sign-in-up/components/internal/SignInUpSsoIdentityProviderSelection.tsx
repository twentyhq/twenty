/* @license Enterprise */

import { StyledOnboardingContentContainer } from '@/auth/components/StyledOnboardingContentContainer';
import { useSso } from '@/auth/sign-in-up/hooks/useSso';
import { guessSsoIdentityProviderIconByUrl } from '@/settings/security/utils/guessSsoIdentityProviderIconByUrl';

import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';
import React from 'react';
import { isDefined } from 'twenty-shared/utils';
import { MainButton } from 'twenty-ui/components/input';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SignInUpSeparator } from './SignInUpSeparator';

export const SignInUpSsoIdentityProviderSelection = () => {
  const workspaceAuthProviders = useAtomStateValue(workspaceAuthProvidersState);

  const { redirectToSsoLoginPage } = useSso();

  return (
    <>
      <StyledOnboardingContentContainer>
        {isDefined(workspaceAuthProviders?.sso) &&
          workspaceAuthProviders?.sso.map((identityProvider) => {
            const IdentityProviderIcon = guessSsoIdentityProviderIconByUrl(
              identityProvider.issuer,
            );

            return (
              <React.Fragment key={identityProvider.id}>
                <MainButton
                  onClick={() => redirectToSsoLoginPage(identityProvider.id)}
                  startIcon={<IdentityProviderIcon />}
                  fullWidth
                >
                  {identityProvider.name}
                </MainButton>
                <SignInUpSeparator />
              </React.Fragment>
            );
          })}
      </StyledOnboardingContentContainer>
    </>
  );
};
