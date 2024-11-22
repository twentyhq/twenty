/* @license Enterprise */

import { useSSO } from '@/auth/sign-in-up/hooks/useSSO';
import { guessSSOIdentityProviderIconByUrl } from '@/settings/security/utils/guessSSOIdentityProviderIconByUrl';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { MainButton, HorizontalSeparator } from 'twenty-ui';

import { isDefined } from '~/utils/isDefined';
import { authProvidersState } from '@/client-config/states/authProvidersState';

const StyledContentContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

export const SignInUpSSOIdentityProviderSelection = () => {
  const authProviders = useRecoilValue(authProvidersState);

  const { redirectToSSOLoginPage } = useSSO();

  return (
    <>
      <StyledContentContainer>
        {isDefined(authProviders?.sso) &&
          authProviders?.sso.map((idp) => (
            <>
              <MainButton
                key={idp.id}
                title={idp.name}
                onClick={() => redirectToSSOLoginPage(idp.id)}
                Icon={guessSSOIdentityProviderIconByUrl(idp.issuer)}
                fullWidth
              />
              <HorizontalSeparator visible={false} />
            </>
          ))}
      </StyledContentContainer>
    </>
  );
};
