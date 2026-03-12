import { FIND_APPLICATION_REGISTRATION_BY_CLIENT_ID } from '@/settings/application-registrations/graphql/queries/findApplicationRegistrationByClientId';
import { styled } from '@linaria/react';
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
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useAuthorizeAppMutation } from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100dvh;
  justify-content: center;
  width: 100%;
`;

const StyledAppsContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[4]};
  justify-content: center;
`;

const StyledText = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-family: 'Inter';
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding: ${themeCssVariables.spacing[6]} 0px;
`;

const StyledCardWrapper = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: ${themeCssVariables.spacing[6]};
  width: 400px;
`;

const StyledButtonContainer = styled.div`
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr 1fr;
  width: 100%;
`;

const StyledScopeList = styled.ul`
  list-style: none;
  margin: 0 0 ${themeCssVariables.spacing[4]} 0;
  padding: 0;
  width: 100%;
`;

const StyledScopeItem = styled.li`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  padding: ${themeCssVariables.spacing[1]} 0;

  &:last-child {
    border-bottom: none;
  }
`;

const StyledErrorText = styled.div`
  color: ${themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]} 0;
  text-align: center;
  width: 100%;
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

  // Support both camelCase (legacy) and standard OAuth snake_case params
  const clientId = searchParam.get('client_id') ?? searchParam.get('clientId');
  const codeChallenge =
    searchParam.get('code_challenge') ?? searchParam.get('codeChallenge');
  const redirectUrl =
    searchParam.get('redirect_uri') ?? searchParam.get('redirectUrl');

  const {
    data,
    loading,
    error: queryError,
  } = useQuery(FIND_APPLICATION_REGISTRATION_BY_CLIENT_ID, {
    variables: { clientId: clientId ?? '' },
    skip: !isDefined(clientId),
  });

  const applicationRegistration = data?.findApplicationRegistrationByClientId;
  const [authorizeApp] = useAuthorizeAppMutation();
  const [hasLogoError, setHasLogoError] = useState(false);
  const [authorizeError, setAuthorizeError] = useState<string | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  const shouldRedirectToNotFound =
    !isDefined(clientId) || (!loading && !isDefined(applicationRegistration));

  useEffect(() => {
    if (shouldRedirectToNotFound) {
      navigate(AppPath.NotFound);
    }
  }, [shouldRedirectToNotFound, navigate]);

  const handleAuthorize = async () => {
    if (isDefined(clientId) && isDefined(redirectUrl)) {
      setIsAuthorizing(true);
      setAuthorizeError(null);

      await authorizeApp({
        variables: {
          clientId,
          codeChallenge: codeChallenge ?? undefined,
          redirectUrl,
        },
        onCompleted: (responseData) => {
          redirect(responseData.authorizeApp.redirectUrl);
        },
        onError: (error) => {
          setIsAuthorizing(false);
          setAuthorizeError(
            error.message || t`Authorization failed. Please try again.`,
          );
        },
      });
    }
  };

  if (isDefined(queryError)) {
    return (
      <StyledContainer>
        <StyledCardWrapper>
          <StyledText>
            <Trans>Something went wrong</Trans>
          </StyledText>
          <StyledErrorText>
            {t`Unable to load application details. Please try again later.`}
          </StyledErrorText>
        </StyledCardWrapper>
      </StyledContainer>
    );
  }

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
        {authorizeError && <StyledErrorText>{authorizeError}</StyledErrorText>}
        <StyledButtonContainer>
          <UndecoratedLink to={AppPath.Index}>
            <MainButton
              title={t`Cancel`}
              variant="secondary"
              fullWidth
              disabled={isAuthorizing}
            />
          </UndecoratedLink>
          <MainButton
            title={isAuthorizing ? t`Authorizing...` : t`Authorize`}
            onClick={handleAuthorize}
            disabled={isAuthorizing}
            fullWidth
          />
        </StyledButtonContainer>
      </StyledCardWrapper>
    </StyledContainer>
  );
};
