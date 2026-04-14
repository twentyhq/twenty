import { SettingsPath } from 'twenty-shared/types';
import { t } from '@lingui/core/macro';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { FindOneApplicationDocument } from '~/generated-metadata/graphql';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import {
  IconApps,
  IconBox,
  IconInfoCircle,
  IconLock,
  IconSettings,
} from 'twenty-ui/display';
import { SettingsApplicationDetailSkeletonLoader } from '~/pages/settings/applications/components/SettingsApplicationDetailSkeletonLoader';
import { SettingsApplicationDetailTitle } from '~/pages/settings/applications/components/SettingsApplicationDetailTitle';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { SettingsApplicationDetailContentTab } from '~/pages/settings/applications/tabs/SettingsApplicationDetailContentTab';
import { SettingsApplicationDetailAboutTab } from '~/pages/settings/applications/tabs/SettingsApplicationDetailAboutTab';
import { SettingsApplicationDetailSettingsTab } from '~/pages/settings/applications/tabs/SettingsApplicationDetailSettingsTab';
import { SettingsApplicationPermissionsTab } from '~/pages/settings/applications/tabs/SettingsApplicationPermissionsTab';
import { SettingsApplicationCustomTab } from '~/pages/settings/applications/tabs/SettingsApplicationCustomTab';
import type { SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';

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

  const applicationName = application?.name ?? t`Application details`;
  const applicationDescription = application?.description ?? undefined;
  const applicationLogoUrl =
    application?.applicationRegistration?.logoUrl ?? undefined;

  const settingsCustomTabFrontComponentId =
    application?.settingsCustomTabFrontComponentId;

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
    switch (activeTabId) {
      case 'about':
        return <SettingsApplicationDetailAboutTab application={application} />;
      case 'content':
        return (
          <SettingsApplicationDetailContentTab application={application} />
        );
      case 'permissions':
        return (
          <SettingsApplicationPermissionsTab
            defaultRoleId={application?.defaultRoleId}
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
          displayName={applicationName}
          description={applicationDescription}
          logoUrl={applicationLogoUrl}
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
        { children: applicationName },
      ]}
    >
      <SettingsPageContainer>
        <TabList tabs={tabs} componentInstanceId={APPLICATION_DETAIL_ID} />
        {!isDefined(application) ? (
          <SettingsApplicationDetailSkeletonLoader />
        ) : (
          renderActiveTabContent()
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
