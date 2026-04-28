import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconEye, IconSettings } from 'twenty-ui/display';
import { FindOneApplicationDocument } from '~/generated-metadata/graphql';
import { SettingsApplicationFrontComponentPreviewTab } from '~/pages/settings/applications/tabs/SettingsApplicationFrontComponentPreviewTab';
import { SettingsApplicationFrontComponentSettingsTab } from '~/pages/settings/applications/tabs/SettingsApplicationFrontComponentSettingsTab';

const FRONT_COMPONENT_DETAIL_ID = 'application-front-component-detail';

export const SettingsApplicationFrontComponentDetail = () => {
  const { applicationId = '', frontComponentId = '' } = useParams<{
    applicationId: string;
    frontComponentId: string;
  }>();

  const { data, loading } = useQuery(FindOneApplicationDocument, {
    variables: { id: applicationId },
    skip: !applicationId,
  });

  const application = data?.findOneApplication;
  const frontComponent = application?.frontComponents?.find(
    (fc) => fc.id === frontComponentId,
  );

  const instanceId = `${FRONT_COMPONENT_DETAIL_ID}-${frontComponentId}`;
  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    instanceId,
  );

  const tabs = [
    { id: 'preview', title: t`Preview`, Icon: IconEye },
    { id: 'settings', title: t`Settings`, Icon: IconSettings },
  ];

  const applicationContentHref = getSettingsPath(
    SettingsPath.ApplicationDetail,
    { applicationId },
    undefined,
    'content',
  );
  const breadcrumbLinks = [
    {
      children: t`Workspace`,
      href: getSettingsPath(SettingsPath.Workspace),
    },
    {
      children: t`Applications`,
      href: getSettingsPath(SettingsPath.Applications),
    },
    { children: application?.name ?? '', href: applicationContentHref },
    { children: t`Front components`, href: applicationContentHref },
    { children: frontComponent?.name ?? '' },
  ];

  const renderActiveTabContent = () => {
    if (!isDefined(frontComponent)) {
      return <SettingsSectionSkeletonLoader />;
    }

    const resolvedTabId = activeTabId ?? 'preview';

    switch (resolvedTabId) {
      case 'preview':
        return (
          <SettingsApplicationFrontComponentPreviewTab
            frontComponentId={frontComponent.id}
            isHeadless={frontComponent.isHeadless}
          />
        );
      case 'settings':
        return (
          <SettingsApplicationFrontComponentSettingsTab
            description={frontComponent.description}
            componentName={frontComponent.componentName}
            universalIdentifier={frontComponent.universalIdentifier}
            builtComponentChecksum={frontComponent.builtComponentChecksum}
            isHeadless={frontComponent.isHeadless}
            usesSdkClient={frontComponent.usesSdkClient}
            createdAt={frontComponent.createdAt}
            updatedAt={frontComponent.updatedAt}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SubMenuTopBarContainer
      title={frontComponent?.name ?? t`Front component`}
      links={breadcrumbLinks}
    >
      <SettingsPageContainer>
        <TabList tabs={tabs} componentInstanceId={instanceId} />
        {loading ? <SettingsSectionSkeletonLoader /> : renderActiveTabContent()}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
