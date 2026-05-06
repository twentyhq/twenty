import { CurrentApplicationContext } from '@/applications/contexts/CurrentApplicationContext';
import { useInstallMarketplaceApp } from '@/marketplace/hooks/useInstallMarketplaceApp';
import { useUpgradeApplication } from '@/marketplace/hooks/useUpgradeApplication';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useParams } from 'react-router-dom';
import { type Manifest } from 'twenty-shared/application';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  IconBook,
  IconBox,
  IconCommand,
  IconGraph,
  IconInfoCircle,
  IconLego,
  IconListDetails,
  IconLock,
  IconShield,
} from 'twenty-ui/display';
import {
  ApplicationRegistrationSourceType,
  FindMarketplaceAppDetailDocument,
  FindOneApplicationByUniversalIdentifierDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { SettingsApplicationDetailTitle } from '~/pages/settings/applications/components/SettingsApplicationDetailTitle';
import { SettingsApplicationDetailAboutTab } from '~/pages/settings/applications/tabs/SettingsApplicationDetailAboutTab';
import { SettingsApplicationDetailContentTab } from '~/pages/settings/applications/tabs/SettingsApplicationDetailContentTab';
import { SettingsApplicationPermissionsTab } from '~/pages/settings/applications/tabs/SettingsApplicationPermissionsTab';
import { isNewerSemver } from '~/pages/settings/applications/utils/isNewerSemver';

const AVAILABLE_APPLICATION_DETAIL_ID = 'available-application-detail';

export const SettingsAvailableApplicationDetails = () => {
  const { availableApplicationId = '' } = useParams<{
    availableApplicationId: string;
  }>();

  const { install, isInstalling } = useInstallMarketplaceApp();
  const { upgrade, isUpgrading } = useUpgradeApplication();

  const canInstallMarketplaceApps = useHasPermissionFlag(
    PermissionFlagType.MARKETPLACE_APPS,
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

  const application = applicationData?.findOneApplication;

  const detail = detailData?.findMarketplaceAppDetail;
  const manifest = detail?.manifest as Manifest | undefined;
  const app = manifest?.application;

  const displayName = app?.displayName ?? detail?.name ?? '';
  const description = app?.description ?? '';

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

  const defaultRole = manifest?.roles?.find(
    (r) => r.universalIdentifier === app?.defaultRoleUniversalIdentifier,
  );

  const hasUpdate =
    isNpmApp &&
    isDefined(latestAvailableVersion) &&
    isDefined(currentVersion) &&
    isNewerSemver(latestAvailableVersion, currentVersion);

  const handleInstall = async () => {
    if (isDefined(detail)) {
      await install({
        universalIdentifier: detail.universalIdentifier,
      });
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
      count: (manifest?.roles ?? []).filter(
        (role) =>
          role.universalIdentifier !==
          manifest?.application.defaultRoleUniversalIdentifier,
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
            aboutDescription={app?.aboutDescription}
            screenshots={app?.screenshots}
            author={app?.author ?? 'Unknown'}
            category={app?.category}
            contentEntries={contentEntries}
            currentVersion={
              isAlreadyInstalled
                ? (application.version ?? undefined)
                : undefined
            }
            latestAvailableVersion={detail.latestAvailableVersion ?? '0.0.0'}
            developerLinks={{
              websiteUrl: app?.websiteUrl,
              termsUrl: app?.termsUrl,
              emailSupport: app?.emailSupport,
              issueReportUrl: app?.issueReportUrl,
              sourcePackageUrl,
            }}
            isInstalled={isAlreadyInstalled}
            canInstallMarketplaceApps={canInstallMarketplaceApps}
            onInstall={handleInstall}
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
              logo: app?.logoUrl,
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
      <SubMenuTopBarContainer
        links={[
          {
            children: t`Workspace`,
            href: getSettingsPath(SettingsPath.Workspace),
          },
          {
            children: t`Applications`,
            href: getSettingsPath(SettingsPath.Applications),
          },
          { children: displayName },
        ]}
        title={
          <SettingsApplicationDetailTitle
            displayName={displayName}
            description={description}
            applicationId={application?.id}
            isUnlisted={isUnlisted}
          />
        }
      >
        <SettingsPageContainer>
          <TabList
            tabs={tabs}
            componentInstanceId={AVAILABLE_APPLICATION_DETAIL_ID}
          />
          {renderActiveTabContent()}
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </CurrentApplicationContext.Provider>
  );
};
