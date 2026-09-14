import { BUTTON_ACTION_CLASS_NAME } from '@/ui/input/styles/ButtonActionClassName';

/* @license Enterprise */

import { StyledOnboardingContentContainer } from '@/auth/components/StyledOnboardingContentContainer';
import { useSso } from '@/auth/sign-in-up/hooks/useSso';
import { guessSsoIdentityProviderIconByUrl } from '@/settings/security/utils/guessSsoIdentityProviderIconByUrl';

import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';
import React, { createElement } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { HorizontalSeparator } from 'twenty-ui/layout';
import { Button } from 'twenty-ui/input';
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
              <Button
                className={BUTTON_ACTION_CLASS_NAME}
                onClick={() => redirectToSsoLoginPage(idp.id)}
                startIcon={createElement(
                  guessSsoIdentityProviderIconByUrl(idp.issuer),
                )}
                fullWidth
                elevated
                variant="solid"
              >
                {idp.name}
              </Button>
              <HorizontalSeparator visible={false} />
            </React.Fragment>
          ))}
      </StyledOnboardingContentContainer>
    </>
  );
};
