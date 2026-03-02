import { FIND_APPLICATION_REGISTRATION_BY_CLIENT_ID } from '@/settings/application-registrations/graphql/queries/findApplicationRegistrationByClientId';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { Trans, useLingui } from '@lingui/react/macro';
import { useQuery } from '@apollo/client';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/display';
import { MainButton } from 'twenty-ui/input';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { useAuthorizeAppMutation } from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  height: 100dvh;
  justify-content: center;
  width: 100%;
`;

const StyledAppsContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
`;

const StyledText = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-family: 'Inter';
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  padding: ${({ theme }) => theme.spacing(6)} 0px;
`;

const StyledCardWrapper = styled.div`
  display: flex;
  background-color: ${({ theme }) => theme.background.primary};
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 400px;
  padding: ${({ theme }) => theme.spacing(6)};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  border-radius: ${({ theme }) => theme.border.radius.md};
`;

const StyledButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  width: 100%;
`;

const StyledScopeList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 ${({ theme }) => theme.spacing(4)} 0;
  width: 100%;
`;

const StyledScopeItem = styled.li`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  padding: ${({ theme }) => theme.spacing(1)} 0;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};

  &:last-child {
    border-bottom: none;
  }
`;

export const Authorize = () => {
  const { t } = useLingui();
  const navigate = useNavigateApp();
  const [searchParam] = useSearchParams();
  const { redirect } = useRedirect();

  const oauthScopeLabels: { [scope: string]: string | undefined } = {
    api: t`Access workspace data`,
    profile: t`Read your profile`,
  };

  const clientId = searchParam.get('clientId');
  const codeChallenge = searchParam.get('codeChallenge');
  const redirectUrl = searchParam.get('redirectUrl');

  const { data, loading } = useQuery(
    FIND_APPLICATION_REGISTRATION_BY_CLIENT_ID,
    {
      variables: { clientId: clientId ?? '' },
      skip: !isDefined(clientId),
    },
  );

  const applicationRegistration = data?.findApplicationRegistrationByClientId;
  const [authorizeApp] = useAuthorizeAppMutation();
  const [hasLogoError, setHasLogoError] = useState(false);

  const shouldRedirectToNotFound =
    !isDefined(clientId) || (!loading && !isDefined(applicationRegistration));

  useEffect(() => {
    if (shouldRedirectToNotFound) {
      navigate(AppPath.NotFound);
    }
  }, [shouldRedirectToNotFound, navigate]);

  const handleAuthorize = async () => {
    if (isDefined(clientId) && isDefined(redirectUrl)) {
      await authorizeApp({
        variables: {
          clientId,
          codeChallenge: codeChallenge ?? undefined,
          redirectUrl,
        },
        onCompleted: (responseData) => {
          redirect(responseData.authorizeApp.redirectUrl);
        },
      });
    }
  };

  if (loading || !applicationRegistration) {
    return null;
  }

  const appName = applicationRegistration.name;
  const appLogoUrl = applicationRegistration.logoUrl;
  const requestedScopes: string[] = applicationRegistration.oAuthScopes ?? [];

  const showLogoImage = isNonEmptyString(appLogoUrl) && !hasLogoError;

  return (
    <StyledContainer>
      <StyledCardWrapper>
        <StyledAppsContainer>
          <img
            src="/images/integrations/twenty-logo.svg"
            alt="twenty-icon"
            height={40}
            width={40}
          />
          <img
            src="/images/integrations/link-apps.svg"
            alt="link-icon"
            height={60}
            width={60}
          />
          {showLogoImage ? (
            <img
              src={appLogoUrl}
              alt={appName}
              height={40}
              width={40}
              style={{ borderRadius: '2px' }}
              onError={() => setHasLogoError(true)}
            />
          ) : (
            <Avatar
              size="xl"
              placeholder={appName}
              placeholderColorSeed={appName}
              type="squared"
            />
          )}
        </StyledAppsContainer>
        <StyledText>
          <Trans>{appName} wants to access your account</Trans>
        </StyledText>
        {requestedScopes.length > 0 && (
          <StyledScopeList>
            {requestedScopes.map((scope) => (
              <StyledScopeItem key={scope}>
                {oauthScopeLabels[scope] ?? scope}
              </StyledScopeItem>
            ))}
          </StyledScopeList>
        )}
        <StyledButtonContainer>
          <UndecoratedLink to={AppPath.Index}>
            <MainButton title={t`Cancel`} variant="secondary" fullWidth />
          </UndecoratedLink>
          <MainButton
            title={t`Authorize`}
            onClick={handleAuthorize}
            fullWidth
          />
        </StyledButtonContainer>
      </StyledCardWrapper>
    </StyledContainer>
  );
};
