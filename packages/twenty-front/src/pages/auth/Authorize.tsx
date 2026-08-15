import styled from '@emotion/styled';
import { useMutation, useQuery } from '@apollo/client';
import { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import {
  H1TitleFontColor,
  IconComponent,
  IconDatabase,
  IconUserCircle,
  ModalContent,
  useGlobalHotkeys,
  useRedirect,
} from 'twenty-ui';
import { Key } from 'ts-key-enum';
import { t, Trans } from '@lingui/macro';
import { useLingui } from '@lingui/react/macro';

import { AppConnectionHeader } from '@/auth/components/AppConnectionHeader';
import { AuthorizeActionButtons } from '@/auth/components/AuthorizeActionButtons';
import { StyledOAuthTitle } from '@/auth/components/StyledOAuthTitle';
import {
  AuthorizeAppDocument,
  FindApplicationRegistrationByClientIdDocument,
} from '~/generated/graphql';
import { ThemeContext } from '@/ui/theme/contexts/ThemeContext';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { AppPath } from '~/types/AppPath';

const StyledCardWrapper = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  display: flex;
  flex-direction: column;
  max-width: 400px;
  overflow: hidden;
  width: 100%;
`;

const StyledHeader = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(6)};
`;

const StyledPermissionSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledPermissionIntro = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledScopeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledScopeItem = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledScopeIcon = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
`;

const StyledErrorText = styled.span`
  color: ${({ theme }) => theme.color.red};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-top: ${({ theme }) => theme.spacing(2)};
  text-align: center;
  width: 100%;
`;

const OAUTH_SCOPE_ICONS: { [scope: string]: IconComponent | undefined } = {
  api: IconDatabase,
  profile: IconUserCircle,
};

export const Authorize = () => {
  const { t } = useLingui();
  const { theme, colorScheme } = useContext(ThemeContext);
  const navigate = useNavigateApp();
  const [searchParam] = useSearchParams();
  const { redirect } = useRedirect();

  const oauthScopeLabels: { [scope: string]: string | undefined } = {
    api: t`Access your workspace data`,
    profile: t`Read your profile`,
  };

  // Support both camelCase (legacy) and standard OAuth snake_case params
  const clientId = searchParam.get('client_id') ?? searchParam.get('clientId');
  const codeChallenge =
    searchParam.get('code_challenge') ?? searchParam.get('codeChallenge');
  const redirectUrl =
    searchParam.get('redirect_uri') ?? searchParam.get('redirectUrl');
  const state = searchParam.get('state');

  const {
    data,
    loading,
    error: queryError,
  } = useQuery(FindApplicationRegistrationByClientIdDocument, {
    variables: { clientId: clientId ?? '' },
    skip: !isDefined(clientId),
  });

  const applicationRegistration = data?.findApplicationRegistrationByClientId;
  const [authorizeApp] = useMutation(AuthorizeAppDocument);
  const [authorizeError, setAuthorizeError] = useState<string | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  const shouldRedirectToNotFound =
    !isDefined(clientId) || (!loading && !isDefined(applicationRegistration));

  useEffect(() => {
    if (shouldRedirectToNotFound) {
      navigate(AppPath.NotFound);
    }
  }, [shouldRedirectToNotFound, navigate]);

  const appendThemeToUrl = (urlString: string) => {
    try {
      const url = new URL(urlString);

      url.searchParams.set('theme', colorScheme);
      if (!url.searchParams.has('iss')) {
        url.searchParams.set('iss', window.location.origin);
      }

      return url.toString();
    } catch {
      return urlString;
    }
  };

  const handleAuthorize = async () => {
    if (isDefined(clientId) && isDefined(redirectUrl)) {
      setIsAuthorizing(true);
      setAuthorizeError(null);

      await authorizeApp({
        variables: {
          clientId,
          codeChallenge: codeChallenge ?? undefined,
          redirectUrl,
          state: state ?? undefined,
        },
        onCompleted: (responseData) => {
          redirect(appendThemeToUrl(responseData.authorizeApp.redirectUrl));
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

  useGlobalHotkeys({
    keys: [Key.Enter],
    callback: (keyboardEvent) => {
      if (
        keyboardEvent.target instanceof HTMLButtonElement ||
        loading ||
        isAuthorizing ||
        !isDefined(applicationRegistration)
      ) {
        return;
      }

      handleAuthorize();
    },
    containsModifier: false,
    dependencies: [
      loading,
      isAuthorizing,
      applicationRegistration,
      clientId,
      redirectUrl,
    ],
    options: {
      preventDefault: false,
    },
  });

  if (isDefined(queryError)) {
    return (
      <ModalContent isVerticallyCentered isHorizontallyCentered>
        <StyledCardWrapper>
          <ModalContent contentPadding={10}>
            <StyledOAuthTitle
              title={<Trans>Something went wrong</Trans>}
              fontColor={H1TitleFontColor.Primary}
            />
            <StyledErrorText>
              {t`Unable to load application details. Please try again later.`}
            </StyledErrorText>
          </ModalContent>
        </StyledCardWrapper>
      </ModalContent>
    );
  }

  if (loading || !applicationRegistration) {
    return null;
  }

  const appName = applicationRegistration.name;
  const appLogoUrl = applicationRegistration.logoUrl;
  const requestedScopes: string[] = applicationRegistration.oAuthScopes ?? [];

  return (
    <ModalContent isVerticallyCentered isHorizontallyCentered>
      <StyledCardWrapper>
        <StyledHeader>
          <AppConnectionHeader appLogoUrl={appLogoUrl} appName={appName} />
        </StyledHeader>
        <ModalContent contentPadding={10}>
          <StyledOAuthTitle
            title={<Trans>Connect {appName} to your account</Trans>}
            fontColor={H1TitleFontColor.Primary}
          />
          {requestedScopes.length > 0 && (
            <StyledPermissionSection>
              <StyledPermissionIntro>
                <Trans>{appName} would like to:</Trans>
              </StyledPermissionIntro>
              <StyledScopeList>
                {requestedScopes.map((scope) => {
                  const ScopeIcon = OAUTH_SCOPE_ICONS[scope] ?? IconDatabase;

                  return (
                    <StyledScopeItem key={scope}>
                      <StyledScopeIcon>
                        <ScopeIcon
                          size={theme.icon.size.md}
                          stroke={theme.icon.stroke.sm}
                        />
                      </StyledScopeIcon>
                      <span>{oauthScopeLabels[scope] ?? scope}</span>
                    </StyledScopeItem>
                  );
                })}
              </StyledScopeList>
            </StyledPermissionSection>
          )}
          {authorizeError && (
            <StyledErrorText>{authorizeError}</StyledErrorText>
          )}
          <AuthorizeActionButtons
            onCancel={() => navigate(AppPath.Index)}
            onAuthorize={handleAuthorize}
            isLoading={isAuthorizing}
          />
        </ModalContent>
      </StyledCardWrapper>
    </ModalContent>
  );
};
