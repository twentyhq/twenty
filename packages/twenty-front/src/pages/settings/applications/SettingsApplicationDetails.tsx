import { SettingsPath } from 'twenty-shared/types';
import { t } from '@lingui/core/macro';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useParams } from 'react-router-dom';
import { useFindOneApplicationQuery } from '~/generated-metadata/graphql';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { IconInfoCircle, IconSettings, IconBox } from 'twenty-ui/display';
import { SettingsApplicationDetailSkeletonLoader } from '~/pages/settings/applications/components/SettingsApplicationDetailSkeletonLoader';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { SettingsApplicationDetailContentTab } from '~/pages/settings/applications/tabs/SettingsApplicationDetailContentTab';
import { SettingsApplicationDetailAboutTab } from '~/pages/settings/applications/tabs/SettingsApplicationDetailAboutTab';
import { SettingsApplicationDetailSettingsTab } from '~/pages/settings/applications/tabs/SettingsApplicationDetailSettingsTab';

const APPLICATION_DETAIL_ID = 'application-detail-id';

export const SettingsApplicationDetails = () => {
  const { applicationId = '' } = useParams<{ applicationId: string }>();

  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    APPLICATION_DETAIL_ID,
  );

  const { data } = useFindOneApplicationQuery({
    variables: { id: applicationId },
    skip: !applicationId,
  });

  const application = data?.findOneApplication;

  const applicationName = application?.name;

  const title = !isDefined(application)
    ? t`Application details`
    : applicationName;

  const tabs = [
    { id: 'about', title: t`About`, Icon: IconInfoCircle },
    { id: 'content', title: t`Content`, Icon: IconBox },
    { id: 'settings', title: t`Settings`, Icon: IconSettings },
  ];

  const renderActiveTabContent = () => {
    switch (activeTabId) {
      case 'about':
        return <SettingsApplicationDetailAboutTab application={application} />;
      case 'content':
        return (
          <SettingsApplicationDetailContentTab application={application} />
        );
      case 'settings':
        return (
          <SettingsApplicationDetailSettingsTab application={application} />
        );
      default:
        return <></>;
    }
  };

  return (
    <SubMenuTopBarContainer
      title={title}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: t`Applications`,
          href: getSettingsPath(SettingsPath.Applications),
        },
        { children: `${title}` },
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
