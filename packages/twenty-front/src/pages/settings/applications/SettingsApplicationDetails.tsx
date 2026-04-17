import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import type { SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { type Manifest } from 'twenty-shared/application';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  IconApps,
  IconBox,
  IconCommand,
  IconInfoCircle,
  IconListDetails,
  IconLock,
  IconSettings,
} from 'twenty-ui/display';
import {
  FindMarketplaceAppDetailDocument,
  FindOneApplicationDocument,
} from '~/generated-metadata/graphql';
import { SettingsApplicationDetailSkeletonLoader } from '~/pages/settings/applications/components/SettingsApplicationDetailSkeletonLoader';
import { SettingsApplicationDetailTitle } from '~/pages/settings/applications/components/SettingsApplicationDetailTitle';
import { SettingsApplicationCustomTab } from '~/pages/settings/applications/tabs/SettingsApplicationCustomTab';
import { SettingsApplicationDetailAboutTab } from '~/pages/settings/applications/tabs/SettingsApplicationDetailAboutTab';
import { SettingsApplicationDetailContentTab } from '~/pages/settings/applications/tabs/SettingsApplicationDetailContentTab';
import { SettingsApplicationDetailSettingsTab } from '~/pages/settings/applications/tabs/SettingsApplicationDetailSettingsTab';
import { SettingsApplicationPermissionsTab } from '~/pages/settings/applications/tabs/SettingsApplicationPermissionsTab';

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

  const contentEntries = useMemo(
    () => [
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
        icon: IconCommand,
        count: (manifest?.frontComponents ?? []).length,
        one: t`front component`,
        many: t`front components`,
      },
    ],
    [manifest],
  );

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
            contentEntries={isDefined(manifest) ? contentEntries : undefined}
            currentVersion={application.version ?? undefined}
            latestAvailableVersion={
              detail?.latestAvailableVersion ??
              application.applicationRegistration?.latestAvailableVersion ??
              undefined
            }
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
            application={application}
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
