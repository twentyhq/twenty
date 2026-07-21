import { ApplicationDisplay } from '@/applications/components/ApplicationDisplay';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { getDocumentationUrl } from '@/support/utils/getDocumentationUrl';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLazyQuery, useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { i18n } from '@lingui/core';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Callout } from 'twenty-ui/feedback';
import { IconBrandGithub, IconRefresh, IconSearch } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';
import {
  FindClaimableApplicationRegistrationDocument,
  GithubClaimAuthorizationUrlDocument,
  PermissionFlagType,
  SyncMarketplaceCatalogDocument,
} from '~/generated-metadata/graphql';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { getClaimErrorContent } from '~/pages/settings/applications/utils/getClaimErrorContent';

export const CLAIM_ERROR_CODE_SEARCH_PARAM = 'claimErrorCode';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const StyledRow = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledInputContainer = styled.div`
  flex: 1;
`;

const StyledResultCard = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  margin-top: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledResultTitleLink = styled(Link)`
  align-self: flex-start;
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
  text-decoration: none;

  :hover {
    text-decoration: underline;
  }
`;

const StyledHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledCalloutContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[3]};

  & > div {
    max-width: 100%;
  }
`;

export const SettingsClaimApplicationSection = () => {
  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const claimErrorCode = searchParams.get(CLAIM_ERROR_CODE_SEARCH_PARAM);

  const [lookupValue, setLookupValue] = useState('');
  const [notFound, setNotFound] = useState(false);

  const dismissClaimError = () => {
    const nextSearchParams = new URLSearchParams(searchParams);

    nextSearchParams.delete(CLAIM_ERROR_CODE_SEARCH_PARAM);

    navigate(
      { search: nextSearchParams.toString(), hash: location.hash },
      { replace: true },
    );
  };

  const claimError = isDefined(claimErrorCode)
    ? getClaimErrorContent(claimErrorCode)
    : null;

  const canSyncCatalog = useHasPermissionFlag(
    PermissionFlagType.MARKETPLACE_APPS,
  );

  const [runLookup, { data: lookupData, loading: isLookingUp }] = useLazyQuery(
    FindClaimableApplicationRegistrationDocument,
    { fetchPolicy: 'network-only' },
  );

  const [getGithubAuthorizationUrl, { loading: isRedirectingToGithub }] =
    useLazyQuery(GithubClaimAuthorizationUrlDocument, {
      fetchPolicy: 'network-only',
    });

  const [syncCatalog, { loading: isSyncing }] = useMutation(
    SyncMarketplaceCatalogDocument,
  );

  const registration = lookupData?.findClaimableApplicationRegistration ?? null;

  const handleLookup = async () => {
    const trimmed = lookupValue.trim();

    if (trimmed.length === 0) {
      return;
    }

    setNotFound(false);

    const variables = UUID_REGEX.test(trimmed)
      ? { universalIdentifier: trimmed }
      : { sourcePackage: trimmed };

    try {
      const result = await runLookup({ variables });

      if (!isDefined(result.data?.findClaimableApplicationRegistration)) {
        setNotFound(true);
      }
    } catch (error) {
      enqueueErrorSnackBar({
        message:
          error instanceof Error ? error.message : t`Could not run the lookup`,
      });
    }
  };

  const handleClaimWithGithub = async () => {
    if (!isDefined(registration)) {
      return;
    }

    try {
      const result = await getGithubAuthorizationUrl({
        variables: { applicationRegistrationId: registration.id },
      });

      const authorizationUrl = result.data?.githubClaimAuthorizationUrl;

      if (!isDefined(authorizationUrl)) {
        throw new Error(result.error?.message ?? 'Missing authorization URL');
      }

      window.location.href = authorizationUrl;
    } catch (error) {
      enqueueErrorSnackBar({
        message:
          error instanceof Error
            ? error.message
            : t`Could not start the GitHub claim`,
      });
    }
  };

  const handleSync = async () => {
    try {
      await syncCatalog();
      enqueueSuccessSnackBar({
        message: t`Catalog sync started. Try your lookup again in a moment.`,
      });
    } catch (error) {
      enqueueErrorSnackBar({
        message:
          error instanceof Error
            ? error.message
            : t`Could not sync the catalog`,
      });
    }
  };

  const renderCardTitle = (app: {
    universalIdentifier: string;
    name: string;
    logoUrl?: string | null;
  }) => (
    <StyledResultTitleLink
      to={getSettingsPath(SettingsPath.AvailableApplicationDetail, {
        availableApplicationId: app.universalIdentifier,
      })}
    >
      <ApplicationDisplay application={{ name: app.name, logo: app.logoUrl }} />
    </StyledResultTitleLink>
  );

  return (
    <Section>
      <H2Title
        title={t`Claim an application`}
        description={t`Take ownership of an app you published to npm. Enter its exact package name (or universal identifier) to find it.`}
      />
      {isDefined(claimError) && (
        <StyledCalloutContainer>
          <Callout
            variant="error"
            title={t`Could not claim this application`}
            description={i18n._(claimError.message)}
            action={{
              label: t`Read documentation`,
              onClick: () =>
                window.open(
                  getDocumentationUrl({
                    locale: currentWorkspaceMember?.locale,
                    path: claimError.docPath,
                  }),
                  '_blank',
                ),
            }}
            isClosable
            onClose={dismissClaimError}
          />
        </StyledCalloutContainer>
      )}
      <StyledRow>
        <StyledInputContainer>
          <SettingsTextInput
            instanceId="claim-application-lookup"
            value={lookupValue}
            onChange={setLookupValue}
            placeholder={t`e.g. my-twenty-app`}
            fullWidth
            label={t`Package name or universal identifier`}
          />
        </StyledInputContainer>
        <Button
          title={t`Look up`}
          Icon={IconSearch}
          onClick={handleLookup}
          disabled={isLookingUp || lookupValue.trim().length === 0}
        />
        {canSyncCatalog && (
          <Button
            title={t`Sync catalog`}
            variant="secondary"
            Icon={IconRefresh}
            onClick={handleSync}
            disabled={isSyncing}
          />
        )}
      </StyledRow>

      {notFound && (
        <StyledResultCard>
          <StyledHint>
            {t`No application found. If you just published it to npm with the "twenty-app" keyword, sync the catalog and try again.`}
          </StyledHint>
        </StyledResultCard>
      )}

      {isDefined(registration) && registration.isOwned && (
        <StyledResultCard>
          {renderCardTitle(registration)}
          <StyledHint>{t`This application has already been claimed.`}</StyledHint>
        </StyledResultCard>
      )}

      {isDefined(registration) && !registration.isOwned && (
        <StyledResultCard>
          {renderCardTitle(registration)}
          {isDefined(registration.description) && (
            <StyledHint>{registration.description}</StyledHint>
          )}
          <StyledHint>
            {t`Ownership is verified through npm trusted publishing: the package must be published from GitHub Actions with provenance. Sign in with a GitHub account that owns the publishing account or organization — when the package is published by an organization, grant this app access to it on GitHub's authorization screen.`}
          </StyledHint>
          <StyledRow>
            <Button
              title={t`Claim with GitHub`}
              Icon={IconBrandGithub}
              accent="blue"
              onClick={handleClaimWithGithub}
              disabled={isRedirectingToGithub}
            />
          </StyledRow>
        </StyledResultCard>
      )}
    </Section>
  );
};
