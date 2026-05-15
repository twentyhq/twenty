import { styled } from '@linaria/react';
import { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { Trans, useLingui } from '@lingui/react/macro';
import { useQuery, useMutation } from '@apollo/client/react';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import {
  Avatar,
  H1Title,
  H1TitleFontColor,
  IconDatabase,
  IconRefresh,
  IconUserCircle,
  type IconComponent,
} from 'twenty-ui/display';
import { MainButton } from 'twenty-ui/input';
import { ModalContent } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import {
  AuthorizeAppDocument,
  FindApplicationRegistrationByClientIdDocument,
} from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';

const StyledCardWrapper = styled.div`
  --oauth-modal-content-max-width: calc(
    ${themeCssVariables.modal.size.md.width} + ${themeCssVariables.spacing[32]}
  );

  background-color: ${themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  display: flex;
  flex-direction: column;
  max-width: min(
    100%,
    calc(
      var(--oauth-modal-content-max-width) + ${themeCssVariables.spacing[20]}
    )
  );
  overflow: hidden;
  width: fit-content;
`;

const StyledHeader = styled.div`
  align-items: center;
  background-image: url('/images/integrations/oauth-modal-header.png');
  background-position: center;
  background-size: cover;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  height: ${themeCssVariables.spacing[30]};
  justify-content: center;
  width: 100%;
`;

const StyledAppLogoTile = styled.div`
  align-items: center;
  backdrop-filter: ${themeCssVariables.blur.strong};
  background: ${themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  height: ${themeCssVariables.spacing[12]};
  justify-content: center;
  padding: ${themeCssVariables.spacing[1]};
  width: ${themeCssVariables.spacing[12]};
`;

const StyledAppLogo = styled.img`
  border-radius: ${themeCssVariables.border.radius.sm};
  height: ${themeCssVariables.spacing[10]};
  object-fit: cover;
  width: ${themeCssVariables.spacing[10]};
`;

const StyledLinkIconContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.rounded};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-shrink: 0;
  height: ${themeCssVariables.spacing[6]};
  justify-content: center;
  width: ${themeCssVariables.spacing[6]};
`;

const StyledOAuthTitle = styled(H1Title)`
  margin: 0;
  max-width: min(100%, var(--oauth-modal-content-max-width));
  padding-bottom: ${themeCssVariables.spacing[1]};
  text-wrap: balance;
  width: max-content;
`;

const StyledButtonContainer = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(
    2,
    minmax(${themeCssVariables.spacing[0]}, 1fr)
  );
  margin-top: ${themeCssVariables.spacing[8]};
  width: 100%;
`;

const StyledCancelLinkContainer = styled.div`
  min-width: 0;

  a {
    display: block;
  }
`;

const StyledAuthorizeButton = styled(MainButton)`
  box-shadow: none;
`;

const StyledPermissionSection = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: ${themeCssVariables.spacing[6]};
  width: 100%;
`;

const StyledPermissionIntro = styled.p`
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  margin: 0;
  padding: 0 0 ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[1]};
`;

const StyledScopeList = styled.ul`
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
`;

const StyledScopeItem = styled.li`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[2]};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  padding-left: ${themeCssVariables.spacing[2]};

  & + & {
    border-top: 1px solid ${themeCssVariables.border.color.light};
    margin-top: ${themeCssVariables.spacing[3]};
    padding-top: ${themeCssVariables.spacing[3]};
  }

  span {
    min-width: 0;
  }
`;

const StyledScopeIcon = styled.div`
  align-items: center;
  color: ${themeCssVariables.color.blue};
  display: flex;
  flex-shrink: 0;
  justify-content: center;
`;

const StyledErrorText = styled.div`
  color: ${themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.sm};
  margin-top: ${themeCssVariables.spacing[4]};
  text-align: center;
  width: 100%;
`;

const OAUTH_SCOPE_ICONS: { [scope: string]: IconComponent | undefined } = {
  api: IconDatabase,
  profile: IconUserCircle,
};

export const Authorize = () => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
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
          state: state ?? undefined,
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

  const showLogoImage = isNonEmptyString(appLogoUrl) && !hasLogoError;

  return (
    <ModalContent isVerticallyCentered isHorizontallyCentered>
      <StyledCardWrapper>
        <StyledHeader>
          <StyledAppLogoTile>
            <StyledAppLogo src="/images/integrations/twenty-logo.svg" alt="" />
          </StyledAppLogoTile>
          <StyledLinkIconContainer aria-hidden>
            <IconRefresh
              size={theme.icon.size.md}
              stroke={theme.icon.stroke.sm}
            />
          </StyledLinkIconContainer>
          <StyledAppLogoTile>
            {showLogoImage ? (
              <StyledAppLogo
                src={appLogoUrl}
                alt=""
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
          </StyledAppLogoTile>
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
          <StyledButtonContainer>
            <StyledCancelLinkContainer>
              <UndecoratedLink to={AppPath.Index} fullWidth>
                <MainButton
                  title={t`Cancel`}
                  variant="secondary"
                  fullWidth
                  disabled={isAuthorizing}
                />
              </UndecoratedLink>
            </StyledCancelLinkContainer>
            <StyledAuthorizeButton
              title={isAuthorizing ? t`Authorizing...` : t`Authorize`}
              onClick={handleAuthorize}
              disabled={isAuthorizing}
              fullWidth
            />
          </StyledButtonContainer>
        </ModalContent>
      </StyledCardWrapper>
    </ModalContent>
  );
};
