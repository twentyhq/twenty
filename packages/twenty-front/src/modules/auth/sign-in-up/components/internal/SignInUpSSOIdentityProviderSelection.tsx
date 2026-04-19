/* @license Enterprise */

import { useSso } from '@/auth/sign-in-up/hooks/useSso';
import { guessSsoIdentityProviderIconByUrl } from '@/settings/security/utils/guessSsoIdentityProviderIconByUrl';
import { styled } from '@linaria/react';

import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';
import React from 'react';
import { isDefined } from 'twenty-shared/utils';
import { HorizontalSeparator } from 'twenty-ui/display';
import { MainButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledContentContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[8]};
  margin-top: ${themeCssVariables.spacing[4]};
`;

export const SignInUpSsoIdentityProviderSelection = () => {
  const workspaceAuthProviders = useAtomStateValue(workspaceAuthProvidersState);

  const { redirectToSsoLoginPage } = useSso();

  return (
    <>
      <StyledContentContainer>
        {isDefined(workspaceAuthProviders?.Sso) &&
          workspaceAuthProviders?.Sso.map((idp) => (
            <React.Fragment key={idp.id}>
              <MainButton
                title={idp.name}
                onClick={() => redirectToSsoLoginPage(idp.id)}
                Icon={guessSsoIdentityProviderIconByUrl(idp.issuer)}
                fullWidth
              />
              <HorizontalSeparator visible={false} />
            </React.Fragment>
          ))}
      </StyledContentContainer>
    </>
  );
};
