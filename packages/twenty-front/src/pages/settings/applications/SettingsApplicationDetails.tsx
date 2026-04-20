import { useUpgradeApplication } from '@/marketplace/hooks/useUpgradeApplication';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import type { SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMutation, useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { type Manifest } from 'twenty-shared/application';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  IconApps,
  IconBox,
  IconCommand,
  IconGraph,
  IconInfoCircle,
  IconLego,
  IconListDetails,
  IconLock,
  IconSettings,
} from 'twenty-ui/display';
import {
  ApplicationRegistrationSourceType,
  FindMarketplaceAppDetailDocument,
  FindOneApplicationDocument,
  PermissionFlagType,
  UninstallApplicationDocument,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { SettingsApplicationDetailSkeletonLoader } from '~/pages/settings/applications/components/SettingsApplicationDetailSkeletonLoader';
import { SettingsApplicationDetailTitle } from '~/pages/settings/applications/components/SettingsApplicationDetailTitle';
import { SettingsApplicationCustomTab } from '~/pages/settings/applications/tabs/SettingsApplicationCustomTab';
import { SettingsApplicationDetailAboutTab } from '~/pages/settings/applications/tabs/SettingsApplicationDetailAboutTab';
import { SettingsApplicationDetailContentTab } from '~/pages/settings/applications/tabs/SettingsApplicationDetailContentTab';
import { SettingsApplicationDetailSettingsTab } from '~/pages/settings/applications/tabs/SettingsApplicationDetailSettingsTab';
import { SettingsApplicationPermissionsTab } from '~/pages/settings/applications/tabs/SettingsApplicationPermissionsTab';
import { isNewerSemver } from '~/pages/settings/applications/utils/isNewerSemver';

const APPLICATION_DETAIL_ID = 'application-detail-id';

export const SettingsApplicationDetails = () => {
  const { applicationId = '' } = useParams<{ applicationId: string }>();

  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    APPLICATION_DETAIL_ID,
  );

  const { data } = useQuery(FindOneApplicationDocument, {
    variables: { id: applicationId },
    skip: !applicationId,
  });

  const application = data?.findOneApplication;

  const { data: detailData } = useQuery(FindMarketplaceAppDetailDocument, {
    variables: { universalIdentifier: application?.universalIdentifier ?? '' },
    skip: !application?.universalIdentifier,
  });

  const detail = detailData?.findMarketplaceAppDetail;
  const manifest = detail?.manifest as Manifest | undefined;
  const app = manifest?.application;

  const displayName =
    app?.displayName ?? application?.name ?? t`Application details`;
  const description = app?.description ?? application?.description ?? undefined;
  const logoUrl =
    app?.logoUrl ?? application?.applicationRegistration?.logoUrl ?? undefined;

  const settingsCustomTabFrontComponentId =
    application?.settingsCustomTabFrontComponentId;

  const { upgrade, isUpgrading } = useUpgradeApplication();

  const canInstallMarketplaceApps = useHasPermissionFlag(
    PermissionFlagType.MARKETPLACE_APPS,
  );

  const sourceType = application?.applicationRegistration?.sourceType;
  const isNpmApp = sourceType === ApplicationRegistrationSourceType.NPM;
  const registrationId = detail?.id ?? application?.applicationRegistration?.id;
  const currentVersion = application?.version;
  const latestAvailableVersion =
    detail?.latestAvailableVersion ??
    application?.applicationRegistration?.latestAvailableVersion;

  const hasUpdate =
    isNpmApp &&
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

  const [uninstallApplication] = useMutation(UninstallApplicationDocument);
  const [isUninstalling, setIsUninstalling] = useState(false);
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const navigate = useNavigateSettings();

  const handleUninstall = async () => {
    if (!isDefined(application)) return;

    setIsUninstalling(true);
    try {
      await uninstallApplication({
        variables: { universalIdentifier: application.universalIdentifier },
      });
      enqueueSuccessSnackBar({
        message: t`Application successfully uninstalled.`,
      });
      navigate(SettingsPath.Applications);
    } catch {
      enqueueErrorSnackBar({ message: t`Error uninstalling application.` });
    } finally {
      setIsUninstalling(false);
    }
  };

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const applicationObjectIds = useMemo(
    () => new Set((application?.objects ?? []).map((obj) => obj.id)),
    [application?.objects],
  );

  const appFieldExtensionsCount = useMemo(() => {
    if (!isDefined(application)) return 0;

    return objectMetadataItems
      .filter((item) => !applicationObjectIds.has(item.id))
      .reduce(
        (total, item) =>
          total +
          item.fields.filter((field) => field.applicationId === application.id)
            .length,
        0,
      );
  }, [objectMetadataItems, applicationObjectIds, application]);

  const contentEntries = [
    {
      icon: IconBox,
      count: (application?.objects ?? []).length,
      one: t`object`,
      many: t`objects`,
    },
    {
      icon: IconListDetails,
      count: appFieldExtensionsCount,
      one: t`field`,
      many: t`fields`,
    },
    {
      icon: IconCommand,
      count: (application?.logicFunctions ?? []).length,
      one: t`logic function`,
      many: t`logic functions`,
    },
    {
      icon: IconGraph,
      count: (application?.frontComponents ?? []).length,
      one: t`front component`,
      many: t`front components`,
    },
    {
      icon: IconLego,
      count: (application?.agents ?? []).length,
      one: t`agent`,
      many: t`agents`,
    },
  ];

  const tabs: SingleTabProps[] = [
    { id: 'about', title: t`About`, Icon: IconInfoCircle },
    { id: 'content', title: t`Content`, Icon: IconBox },
    {
      id: 'permissions',
      title: t`Permissions`,
      Icon: IconLock,
      tooltipContent: !isDefined(application?.defaultRoleId)
        ? t`No permission defined for this application`
        : undefined,
      disabled: !isDefined(application?.defaultRoleId),
    },
    {
      id: 'settings',
      title: t`Settings`,
      Icon: IconSettings,
      tooltipContent:
        (application?.applicationVariables ?? []).length === 0
          ? t`No variables to set for this application`
          : undefined,
      disabled: (application?.applicationVariables ?? []).length === 0,
    },
    ...(isDefined(settingsCustomTabFrontComponentId)
      ? [{ id: 'custom', title: t`Custom`, Icon: IconApps }]
      : []),
  ];

  const renderActiveTabContent = () => {
    if (!isDefined(application)) {
      return <SettingsApplicationDetailSkeletonLoader />;
    }

    switch (activeTabId) {
      case 'about':
        return (
          <SettingsApplicationDetailAboutTab
            displayName={displayName}
            description={description}
            aboutDescription={app?.aboutDescription}
            screenshots={app?.screenshots}
            author={app?.author}
            category={app?.category}
            contentEntries={contentEntries}
            currentVersion={currentVersion ?? undefined}
            latestAvailableVersion={latestAvailableVersion ?? undefined}
            developerLinks={
              isDefined(app)
                ? {
                    websiteUrl: app.websiteUrl,
                    termsUrl: app.termsUrl,
                    emailSupport: app.emailSupport,
                    issueReportUrl: app.issueReportUrl,
                  }
                : undefined
            }
            isInstalled={true}
            canInstallMarketplaceApps={canInstallMarketplaceApps}
            hasUpdate={hasUpdate}
            onUpgrade={handleUpgrade}
            isUpgrading={isUpgrading}
            canBeUninstalled={application.canBeUninstalled}
            onUninstall={handleUninstall}
            isUninstalling={isUninstalling}
          />
        );
      case 'content':
        return (
          <SettingsApplicationDetailContentTab
            applicationId={application.id}
            installedApplication={application}
            manifestContent={manifest}
          />
        );
      case 'permissions':
        return (
          <SettingsApplicationPermissionsTab
            defaultRoleId={application.defaultRoleId}
          />
        );
      case 'settings':
        return (
          <SettingsApplicationDetailSettingsTab application={application} />
        );
      case 'custom':
        return isDefined(settingsCustomTabFrontComponentId) ? (
          <SettingsApplicationCustomTab
            settingsCustomTabFrontComponentId={
              settingsCustomTabFrontComponentId
            }
          />
        ) : (
          <></>
        );
      default:
        return <></>;
    }
  };

  return (
    <SubMenuTopBarContainer
      title={
        <SettingsApplicationDetailTitle
          displayName={displayName}
          description={description}
          logoUrl={logoUrl}
        />
      }
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
    >
      <SettingsPageContainer>
        <TabList tabs={tabs} componentInstanceId={APPLICATION_DETAIL_ID} />
        {renderActiveTabContent()}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
