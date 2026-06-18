/* @license Enterprise */

import { StyledOnboardingContentContainer } from '@/auth/components/StyledOnboardingContentContainer';
import { useSSO } from '@/auth/sign-in-up/hooks/useSSO';
import { guessSSOIdentityProviderIconByUrl } from '@/settings/security/utils/guessSSOIdentityProviderIconByUrl';

import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';
import React from 'react';
import { isDefined } from 'twenty-shared/utils';
import { HorizontalSeparator } from 'twenty-ui/layout';
import { MainButton } from 'twenty-ui/input';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const SignInUpSSOIdentityProviderSelection = () => {
  const workspaceAuthProviders = useAtomStateValue(workspaceAuthProvidersState);

  const { redirectToSSOLoginPage } = useSSO();

  return (
    <>
      <StyledOnboardingContentContainer>
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
      </StyledOnboardingContentContainer>
    </>
  );
};
