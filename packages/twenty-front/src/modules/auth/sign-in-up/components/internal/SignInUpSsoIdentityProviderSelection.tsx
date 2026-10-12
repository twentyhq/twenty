/* @license Enterprise */

import { StyledOnboardingContentContainer } from '@/auth/components/StyledOnboardingContentContainer';
import { useSso } from '@/auth/sign-in-up/hooks/useSso';
import { guessSsoIdentityProviderIconByUrl } from '@/settings/security/utils/guessSsoIdentityProviderIconByUrl';
import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';
import { styled } from '@linaria/react';
import React from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SignInUpSeparator } from './SignInUpSeparator';

const StyledIdentityProviderButton = styled(Button)`
  --tw-button-font-weight: var(--t-font-weight-semi-bold);
  --tw-button-padding-inline: var(--t-spacing-3);
`;

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
                <StyledIdentityProviderButton
                  elevated
                  variant="solid"
                  onClick={() => redirectToSsoLoginPage(identityProvider.id)}
                  startIcon={<IdentityProviderIcon />}
                  fullWidth
                >
                  {identityProvider.name}
                </StyledIdentityProviderButton>
                <SignInUpSeparator />
              </React.Fragment>
            );
          })}
      </StyledOnboardingContentContainer>
    </>
  );
};
