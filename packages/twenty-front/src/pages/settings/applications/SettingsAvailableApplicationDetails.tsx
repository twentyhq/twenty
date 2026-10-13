import { AppChip } from '@/applications/components/AppChip';
import { CurrentApplicationContext } from '@/applications/contexts/CurrentApplicationContext';
import { SettingsApplicationInstallPermissionValidationModal } from '@/marketplace/components/SettingsApplicationInstallPermissionValidationModal';
import { useCopyMarketplaceAppLink } from '@/marketplace/hooks/useCopyMarketplaceAppLink';
import { useInstallMarketplaceAppWithPermissionValidation } from '@/marketplace/hooks/useInstallMarketplaceAppWithPermissionValidation';
import { getMarketplaceAppDefaultRoleManifest } from '@/marketplace/utils/getMarketplaceAppDefaultRoleManifest';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { SettingsApplicationActionButton } from '@/settings/applications/components/SettingsApplicationActionButton';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useCallback, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { IconAlertTriangle, IconEyeOff, IconShoppingBag } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import {
  ApplicationRegistrationSourceType,
  FindMarketplaceAppDetailDocument,
  FindOneApplicationByUniversalIdentifierDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { SettingsApplicationDetailAbout } from '~/pages/settings/applications/components/SettingsApplicationDetailAbout';
import { SettingsApplicationNotFound } from '~/pages/settings/applications/components/SettingsApplicationNotFound';

export const SettingsAvailableApplicationDetails = () => {
  const { availableApplicationId = '' } = useParams<{
    availableApplicationId: string;
  }>();

  const navigateSettings = useNavigateSettings();
  const handleInstallCompleted = useCallback(
    (installedApplication: { id: string }) => {
      navigateSettings(SettingsPath.ApplicationDetail, {
        applicationId: installedApplication.id,
      });
    },
    [navigateSettings],
  );
  const {
    requestInstall,
    install,
    isInstalling,
    installProgress,
    modalInstanceId,
  } = useInstallMarketplaceAppWithPermissionValidation({
    universalIdentifier: availableApplicationId,
    onCompleted: handleInstallCompleted,
  });
  const { copyMarketplaceAppLink } = useCopyMarketplaceAppLink();

  const canInstallMarketplaceApps = useHasPermissionFlag(
    PermissionFlagType.APPLICATIONS,
  );

  const { data: applicationData } = useQuery(
    FindOneApplicationByUniversalIdentifierDocument,
    {
      variables: { universalIdentifier: availableApplicationId },
      skip: !availableApplicationId,
    },
  );

  const {
    data: detailData,
    error: detailError,
    loading: isDetailLoading,
  } = useQuery(FindMarketplaceAppDetailDocument, {
    variables: { universalIdentifier: availableApplicationId },
    skip: !availableApplicationId,
  });

  const application = applicationData?.findOneApplication;

  const detail = detailData?.findMarketplaceAppDetail;

  // Unknown identifiers come back as an error or as an empty result, and
  // both mean there is nothing to show for this link.
  const isNotFound =
    !availableApplicationId ||
    isDefined(detailError) ||
    (!isDetailLoading && !isDefined(detail));

  const { objectMetadataItems } = useObjectMetadataItems();

  // Workspace labels win over manifest ones so renamed objects read as the user knows them
  const objectLabelsByUniversalIdentifier = useMemo(
    () =>
      Object.fromEntries([
        ...(detail?.objects ?? []).map(
          ({ universalIdentifier, labelPlural }) => [
            universalIdentifier,
            labelPlural,
          ],
        ),
        ...objectMetadataItems.map(({ universalIdentifier, labelPlural }) => [
          universalIdentifier,
          labelPlural,
        ]),
      ]),
    [detail?.objects, objectMetadataItems],
  );

  const displayName = detail?.name ?? t`Application details`;

  const currentVersion = application?.version;
  const latestAvailableVersion = detail?.latestAvailableVersion;

  const isNpmApp = detail?.sourceType === ApplicationRegistrationSourceType.NPM;
  const sourcePackageUrl =
    isNpmApp && detail?.sourcePackage
      ? `https://www.npmjs.com/package/${detail.sourcePackage}`
      : undefined;

  const isUnlisted = isDefined(detail) && !detail.isListed;
  const isNotVetted = isDefined(detail) && !detail.isVetted;

  const defaultRole = getMarketplaceAppDefaultRoleManifest(detail);

  return (
    <CurrentApplicationContext.Provider value={application?.id ?? null}>
      <SettingsPageLayout
        links={[
          {
            children: t`Workspace`,
            href: getSettingsPath(SettingsPath.General),
          },
          {
            children: t`Apps`,
            href: getSettingsPath(SettingsPath.Applications),
          },
          { children: displayName },
        ]}
        title={displayName}
        icon={
          isDefined(detail) ? (
            <AppChip
              applicationId={application?.id}
              logoUrl={detail.logoUrl}
              fallbackApplicationData={{
                name: displayName,
              }}
              size="md"
              chipOnly
            />
          ) : undefined
        }
        actionButton={
          isDefined(detail) ? (
            <SettingsApplicationActionButton
              installedApplicationId={application?.id}
              canInstallMarketplaceApps={canInstallMarketplaceApps}
              onInstall={requestInstall}
              isInstalling={isInstalling}
              installProgress={installProgress}
            />
          ) : undefined
        }
      >
        <SettingsPageContainer overflow="visible">
          {isUnlisted && (
            <InlineBanner
              icon={<IconEyeOff aria-hidden="true" />}
            >{t`Application not listed on the marketplace. It was shared via a direct link`}</InlineBanner>
          )}
          {isNotVetted && (
            <InlineBanner
              status="warning"
              icon={<IconAlertTriangle aria-hidden="true" />}
            >{t`This application is not vetted by Twenty. Use at your own risk.`}</InlineBanner>
          )}
          {isNotFound ? (
            <SettingsApplicationNotFound
              message={t`This application is not available on the marketplace. It may have been removed or the link is incorrect.`}
              action={
                <Button
                  startIcon={<IconShoppingBag />}
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  role="link"
                  render={
                    <Link to={getSettingsPath(SettingsPath.Applications)} />
                  }
                >{t`Browse the marketplace`}</Button>
              }
            />
          ) : isDefined(detail) ? (
            <SettingsApplicationDetailAbout
              applicationId={application?.id}
              logoUrl={detail.logoUrl}
              displayName={displayName}
              description={detail.description ?? undefined}
              aboutDescription={detail.aboutDescription ?? undefined}
              pricingDescription={detail.pricingDescription ?? undefined}
              billsCredits={detail.billsCredits}
              screenshots={detail.galleryImages}
              author={detail.author ?? undefined}
              version={currentVersion ?? latestAvailableVersion ?? undefined}
              installCount={detail.installCount}
              category={detail.category ?? undefined}
              developerLinks={{
                websiteUrl: detail.websiteUrl ?? undefined,
                termsUrl: detail.termsUrl ?? undefined,
                emailSupport: detail.emailSupport ?? undefined,
                issueReportUrl: detail.issueReportUrl ?? undefined,
                sourcePackageUrl,
              }}
              onShare={() => copyMarketplaceAppLink(detail.universalIdentifier)}
            />
          ) : (
            <SettingsSectionSkeletonLoader />
          )}
        </SettingsPageContainer>
      </SettingsPageLayout>
      <SettingsApplicationInstallPermissionValidationModal
        modalInstanceId={modalInstanceId}
        appDisplayName={displayName}
        appLogoUrl={detail?.logoUrl ?? undefined}
        defaultRole={defaultRole}
        objectLabelsByUniversalIdentifier={objectLabelsByUniversalIdentifier}
        requestedCapabilities={detail?.requestedCapabilities}
        billsCredits={detail?.billsCredits}
        isVetted={detail?.isVetted}
        onAuthorize={install}
        isInstalling={isInstalling}
      />
    </CurrentApplicationContext.Provider>
  );
};
