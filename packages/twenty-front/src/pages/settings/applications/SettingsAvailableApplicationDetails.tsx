import { CurrentApplicationContext } from '@/applications/contexts/CurrentApplicationContext';
import { AppChip } from '@/applications/components/AppChip';
import { SettingsApplicationInstallPermissionValidationModal } from '@/marketplace/components/SettingsApplicationInstallPermissionValidationModal';
import { useInstallMarketplaceAppWithPermissionValidation } from '@/marketplace/hooks/useInstallMarketplaceAppWithPermissionValidation';
import { useUpgradeApplication } from '@/marketplace/hooks/useUpgradeApplication';
import { getMarketplaceAppDefaultRoleManifest } from '@/marketplace/utils/getMarketplaceAppDefaultRoleManifest';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useParams } from 'react-router-dom';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { type Manifest } from 'twenty-shared/application';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/feedback';
import {
  IconBook,
  IconBox,
  IconCommand,
  IconEyeOff,
  IconGraph,
  IconInfoCircle,
  IconLego,
  IconListDetails,
  IconLock,
  IconShield,
} from 'twenty-ui/icon';
import {
  ApplicationRegistrationSourceType,
  FindMarketplaceAppDetailDocument,
  FindMarketplaceAppManifestDocument,
  FindOneApplicationByUniversalIdentifierDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { SettingsApplicationDetailAboutTab } from '~/pages/settings/applications/tabs/SettingsApplicationDetailAboutTab';
import { SettingsApplicationDetailContentTab } from '~/pages/settings/applications/tabs/SettingsApplicationDetailContentTab';
import { SettingsApplicationPermissionsTab } from '~/pages/settings/applications/tabs/SettingsApplicationPermissionsTab';
import { isNewerSemver } from '~/pages/settings/applications/utils/isNewerSemver';

const AVAILABLE_APPLICATION_DETAIL_ID = 'available-application-detail';

export const SettingsAvailableApplicationDetails = () => {
  const { availableApplicationId = '' } = useParams<{
    availableApplicationId: string;
  }>();

  const navigateSettings = useNavigateSettings();
  const { requestInstall, install, isInstalling, modalInstanceId } =
    useInstallMarketplaceAppWithPermissionValidation();
  const { upgrade, isUpgrading } = useUpgradeApplication();

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

  const displayName = detail?.name ?? '';
  const description = detail?.description ?? '';

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
    isNpmApp &&
    isDefined(latestAvailableVersion) &&
    isDefined(currentVersion) &&
    isNewerSemver(latestAvailableVersion, currentVersion);

  const handleInstall = async () => {
    if (isDefined(detail)) {
      const data = await install({
        universalIdentifier: detail.universalIdentifier,
      });

      const applicationId = data?.installApplication?.id;

      if (isDefined(applicationId)) {
        navigateSettings(SettingsPath.ApplicationDetail, {
          applicationId,
        });
      }
    }
  };

  const handleUpgrade = async () => {
    if (!isDefined(registrationId) || !isDefined(latestAvailableVersion)) {
      return;
    }

    await upgrade({
      appRegistrationId: registrationId,
      targetVersion: latestAvailableVersion,
    });
  };

  const contentEntries = [
    {
      icon: IconBox,
      count: (manifest?.objects ?? []).length,
      one: t`object`,
      many: t`objects`,
    },
    {
      icon: IconListDetails,
      count: (manifest?.fields ?? []).length,
      one: t`field`,
      many: t`fields`,
    },
    {
      icon: IconCommand,
      count: (manifest?.logicFunctions ?? []).length,
      one: t`logic function`,
      many: t`logic functions`,
    },
    {
      icon: IconGraph,
      count: (manifest?.frontComponents ?? []).filter(
        (fc) =>
          !(manifest?.commandMenuItems ?? [])
            .map((cm) => cm.frontComponentUniversalIdentifier)
            .includes(fc.universalIdentifier),
      ).length,
      one: t`widget`,
      many: t`widgets`,
    },
    {
      icon: IconCommand,
      count: (manifest?.frontComponents ?? []).filter(
        (fc) =>
          !fc.isHeadless &&
          (manifest?.commandMenuItems ?? [])
            .map((cm) => cm.frontComponentUniversalIdentifier)
            .includes(fc.universalIdentifier),
      ).length,
      one: t`command`,
      many: t`commands`,
    },
    {
      icon: IconShield,
      count: (detail?.roles ?? []).filter(
        (role) =>
          role.universalIdentifier !== detail?.defaultRoleUniversalIdentifier,
      ).length,
      one: t`role`,
      many: t`roles`,
    },
    {
      icon: IconBook,
      count: (manifest?.skills ?? []).length,
      one: t`skill`,
      many: t`skills`,
    },
    {
      icon: IconLego,
      count: (manifest?.agents ?? []).length,
      one: t`agent`,
      many: t`agents`,
    },
  ];

  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    AVAILABLE_APPLICATION_DETAIL_ID,
  );

  const tabs = [
    { id: 'about', title: t`About`, Icon: IconInfoCircle },
    { id: 'content', title: t`Content`, Icon: IconBox },
    { id: 'permissions', title: t`Permissions`, Icon: IconLock },
  ];

  const renderActiveTabContent = () => {
    if (!detail) return null;

    switch (activeTabId) {
      case 'about':
        return (
          <SettingsApplicationDetailAboutTab
            displayName={displayName}
            description={description}
            aboutDescription={detail.aboutDescription ?? undefined}
            screenshots={detail.galleryImages}
            author={detail.author ?? 'Unknown'}
            category={detail.category ?? undefined}
            contentEntries={contentEntries}
            currentVersion={
              isAlreadyInstalled
                ? (application.version ?? undefined)
                : undefined
            }
            latestAvailableVersion={detail.latestAvailableVersion ?? '0.0.0'}
            developerLinks={{
              websiteUrl: detail.websiteUrl ?? undefined,
              termsUrl: detail.termsUrl ?? undefined,
              emailSupport: detail.emailSupport ?? undefined,
              issueReportUrl: detail.issueReportUrl ?? undefined,
              sourcePackageUrl,
            }}
            isInstalled={isAlreadyInstalled}
            canInstallMarketplaceApps={canInstallMarketplaceApps}
            onInstall={requestInstall}
            isInstalling={isInstalling}
            hasUpdate={hasUpdate}
            onUpgrade={handleUpgrade}
            isUpgrading={isUpgrading}
          />
        );
      case 'content':
        return (
          <SettingsApplicationDetailContentTab
            applicationId={detail.universalIdentifier}
            manifestContent={manifest}
            applicationInfo={{
              name: displayName,
              logo: detail.logo,
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

  if (!detail) {
    return null;
  }

  return (
    <CurrentApplicationContext.Provider value={application?.id ?? null}>
      <SettingsPageLayout
        links={[
          {
            children: t`Workspace`,
            href: getSettingsPath(SettingsPath.General),
          },
          {
            children: t`Applications`,
            href: getSettingsPath(SettingsPath.Applications),
          },
          { children: displayName },
        ]}
        title={displayName}
        icon={
          <AppChip
            applicationId={application?.id}
            fallbackApplicationData={{
              logo: detail?.logo,
              name: displayName,
            }}
            size="md"
            chipOnly
          />
        }
      >
        <SettingsPageContainer>
          {isUnlisted && (
            <InlineBanner
              LeftIcon={IconEyeOff}
              message={t`Application not listed on the marketplace. It was shared via a direct link`}
            />
          )}
          <TabList
            tabs={tabs}
            componentInstanceId={AVAILABLE_APPLICATION_DETAIL_ID}
          />
          {renderActiveTabContent()}
        </SettingsPageContainer>
      </SettingsPageLayout>
      <SettingsApplicationInstallPermissionValidationModal
        modalInstanceId={modalInstanceId}
        appDisplayName={displayName}
        appLogoUrl={detail?.logo ?? undefined}
        defaultRole={defaultRole}
        onAuthorize={handleInstall}
        isInstalling={isInstalling}
      />
    </CurrentApplicationContext.Provider>
  );
};
