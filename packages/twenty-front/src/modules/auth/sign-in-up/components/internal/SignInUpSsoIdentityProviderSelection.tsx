import { themeCssVariables } from 'twenty-ui/theme-constants';
import { styled } from '@linaria/react';
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

const StyledActionButton = styled(Button)`
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding-inline: ${themeCssVariables.spacing[3]};
`;

export const SignInUpSsoIdentityProviderSelection = () => {
  const workspaceAuthProviders = useAtomStateValue(workspaceAuthProvidersState);

  const { redirectToSsoLoginPage } = useSso();

  return (
    <>
      <StyledOnboardingContentContainer>
        {isDefined(workspaceAuthProviders?.sso) &&
          workspaceAuthProviders?.sso.map((idp) => (
            <React.Fragment key={idp.id}>
              <StyledActionButton
                onClick={() => redirectToSsoLoginPage(idp.id)}
                startIcon={createElement(
                  guessSsoIdentityProviderIconByUrl(idp.issuer),
                )}
                fullWidth
                elevated
                variant="solid"
              >
                {idp.name}
              </StyledActionButton>
              <HorizontalSeparator visible={false} />
            </React.Fragment>
          ))}
      </StyledOnboardingContentContainer>
    </>
  );
};
