import { AppChip } from '@/applications/components/AppChip';
import { CurrentApplicationContext } from '@/applications/contexts/CurrentApplicationContext';
import { SettingsApplicationInstallPermissionValidationModal } from '@/marketplace/components/SettingsApplicationInstallPermissionValidationModal';
import { useCopyMarketplaceAppLink } from '@/marketplace/hooks/useCopyMarketplaceAppLink';
import { useInstallMarketplaceAppWithPermissionValidation } from '@/marketplace/hooks/useInstallMarketplaceAppWithPermissionValidation';
import { useUpgradeApplication } from '@/marketplace/hooks/useUpgradeApplication';
import { getMarketplaceAppDefaultRoleManifest } from '@/marketplace/utils/getMarketplaceAppDefaultRoleManifest';
import { SettingsApplicationActionButton } from '@/settings/applications/components/SettingsApplicationActionButton';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { type Manifest } from 'twenty-shared/application';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/primitives/feedback';
import {
  IconBox,
  IconEyeOff,
  IconInfoSquareRounded,
  IconLock,
} from 'twenty-ui/icon';
import {
  ApplicationRegistrationSourceType,
  FindMarketplaceAppDetailDocument,
  FindMarketplaceAppManifestDocument,
  FindOneApplicationByUniversalIdentifierDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { SettingsApplicationDetailAboutTab } from '~/pages/settings/applications/tabs/SettingsApplicationDetailAboutTab';
import { SettingsApplicationDetailContentTab } from '~/pages/settings/applications/tabs/SettingsApplicationDetailContentTab';
import { SettingsApplicationPermissionsTab } from '~/pages/settings/applications/tabs/SettingsApplicationPermissionsTab';
import { isNewerSemver } from '~/pages/settings/applications/utils/isNewerSemver';
import { isUpgradableApplicationSourceType } from '~/pages/settings/applications/utils/isUpgradableApplicationSourceType';

const AVAILABLE_APPLICATION_DETAIL_ID = 'available-application-detail';

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
  const { requestInstall, install, isInstalling, modalInstanceId } =
    useInstallMarketplaceAppWithPermissionValidation({
      universalIdentifier: availableApplicationId,
      onCompleted: handleInstallCompleted,
    });
  const { upgrade, isUpgrading } = useUpgradeApplication();
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

  const { data: detailData } = useQuery(FindMarketplaceAppDetailDocument, {
    variables: { universalIdentifier: availableApplicationId },
    skip: !availableApplicationId,
  });

  const { data: manifestData } = useQuery(FindMarketplaceAppManifestDocument, {
    variables: { universalIdentifier: availableApplicationId },
    skip: !availableApplicationId,
  });

  const application = applicationData?.findOneApplication;

  const detail = detailData?.findMarketplaceAppDetail;
  const manifest = manifestData?.findMarketplaceAppDetail?.manifest as
    | Manifest
    | undefined;

  const displayName = detail?.name ?? t`Application details`;

  const currentVersion = application?.version;
  const latestAvailableVersion = detail?.latestAvailableVersion;

  const sourceType = detail?.sourceType;
  const isNpmApp = sourceType === ApplicationRegistrationSourceType.NPM;
  const registrationId = detail?.id;
  const sourcePackageUrl =
    isNpmApp && detail?.sourcePackage
      ? `https://www.npmjs.com/package/${detail.sourcePackage}`
      : undefined;

  const isUnlisted = isDefined(detail) && !detail.isListed;
  const isAlreadyInstalled = isDefined(application);

  const defaultRole = getMarketplaceAppDefaultRoleManifest(detail);

  const hasUpdate =
    isUpgradableApplicationSourceType(sourceType) &&
    isDefined(latestAvailableVersion) &&
    isDefined(currentVersion) &&
    isNewerSemver(latestAvailableVersion, currentVersion);

  const handleUpgrade = async () => {
    if (!isDefined(registrationId) || !isDefined(latestAvailableVersion)) {
      return;
    }

    await upgrade({
      appRegistrationId: registrationId,
      targetVersion: latestAvailableVersion,
    });
  };

  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    AVAILABLE_APPLICATION_DETAIL_ID,
  );

  const tabs = [
    { id: 'about', title: t`About`, Icon: IconInfoSquareRounded },
    { id: 'content', title: t`Content`, Icon: IconBox },
    { id: 'permissions', title: t`Permissions`, Icon: IconLock },
  ];

  const renderActiveTabContent = () => {
    if (!isDefined(detail)) {
      return <SettingsSectionSkeletonLoader />;
    }

    switch (activeTabId) {
      case 'about':
        return (
          <SettingsApplicationDetailAboutTab
            applicationId={application?.id}
            logoUrl={detail.logoUrl}
            displayName={displayName}
            description={detail.description ?? undefined}
            aboutDescription={detail.aboutDescription ?? undefined}
            pricingDescription={detail.pricingDescription ?? undefined}
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
        );
      case 'content':
        return (
          <SettingsApplicationDetailContentTab
            applicationId={detail.universalIdentifier}
            manifestContent={manifest}
            applicationInfo={{
              name: displayName,
              logoUrl: detail.logoUrl,
              universalIdentifier: detail.universalIdentifier,
            }}
          />
        );
      case 'permissions':
        return (
          <SettingsApplicationPermissionsTab
            marketplaceAppDefaultRole={defaultRole}
            marketplaceAppObjects={manifest?.objects}
          />
        );

      default:
        return null;
    }
  };

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
              isInstalled={isAlreadyInstalled}
              canInstallMarketplaceApps={canInstallMarketplaceApps}
              onInstall={requestInstall}
              isInstalling={isInstalling}
              hasUpdate={hasUpdate}
              latestAvailableVersion={latestAvailableVersion ?? undefined}
              onUpgrade={handleUpgrade}
              isUpgrading={isUpgrading}
            />
          ) : undefined
        }
        secondaryBar={
          <SettingsTabBar
            tabs={tabs}
            componentInstanceId={AVAILABLE_APPLICATION_DETAIL_ID}
          />
        }
      >
        <SettingsPageContainer overflow="visible">
          {isUnlisted && (
            <InlineBanner
              LeftIcon={IconEyeOff}
              message={t`Application not listed on the marketplace. It was shared via a direct link`}
            />
          )}
          {renderActiveTabContent()}
        </SettingsPageContainer>
      </SettingsPageLayout>
      <SettingsApplicationInstallPermissionValidationModal
        modalInstanceId={modalInstanceId}
        appDisplayName={displayName}
        appLogoUrl={detail?.logoUrl ?? undefined}
        defaultRole={defaultRole}
        onAuthorize={install}
        isInstalling={isInstalling}
      />
    </CurrentApplicationContext.Provider>
  );
};
