import { MainButton } from '@/ui/input/components/MainButton';

/* @license Enterprise */

import { StyledOnboardingContentContainer } from '@/auth/components/StyledOnboardingContentContainer';
import { useSso } from '@/auth/sign-in-up/hooks/useSso';
import { guessSsoIdentityProviderIconByUrl } from '@/settings/security/utils/guessSsoIdentityProviderIconByUrl';

import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';
import React, { createElement } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { HorizontalSeparator } from 'twenty-ui/layout';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const SignInUpSsoIdentityProviderSelection = () => {
  const workspaceAuthProviders = useAtomStateValue(workspaceAuthProvidersState);

  const { redirectToSsoLoginPage } = useSso();

  return (
    <>
      <StyledOnboardingContentContainer>
        {isDefined(workspaceAuthProviders?.sso) &&
          workspaceAuthProviders?.sso.map((idp) => (
            <React.Fragment key={idp.id}>
              <MainButton
                onClick={() => redirectToSsoLoginPage(idp.id)}
                startIcon={createElement(
                  guessSsoIdentityProviderIconByUrl(idp.issuer),
                )}
                fullWidth
              >
                {idp.name}
              </MainButton>
              <HorizontalSeparator visible={false} />
            </React.Fragment>
          ))}
      </StyledOnboardingContentContainer>
    </>
  );
};
