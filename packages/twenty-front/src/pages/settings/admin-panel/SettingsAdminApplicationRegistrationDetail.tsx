import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { FindOneAdminApplicationRegistrationDocument } from '~/generated-admin/graphql';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { useLingui } from '@lingui/react/macro';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { APPLICATION_REGISTRATION_ADMIN_PATH } from '@/settings/admin-panel/apps/constants/ApplicationRegistrationAdminPath';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import {
  IconInfoCircle,
  IconKey,
  IconSettings,
  IconWorld,
} from 'twenty-ui/display';
import { SettingsApplicationRegistrationConfigTab } from '~/pages/settings/applications/tabs/SettingsApplicationRegistrationConfigTab';
import { SettingsApplicationRegistrationOAuthTab } from '~/pages/settings/applications/tabs/SettingsApplicationRegistrationOAuthTab';
import { SettingsApplicationRegistrationDistributionTab } from '~/pages/settings/applications/tabs/SettingsApplicationRegistrationDistributionTab';
import { SettingsApplicationRegistrationGeneralTab } from '~/pages/settings/applications/tabs/SettingsApplicationRegistrationGeneralTab';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';

const REGISTRATION_DETAIL_TAB_LIST_ID =
  'admin-application-registration-detail-tab-list';

export const SettingsAdminApplicationRegistrationDetail = () => {
  const { t } = useLingui();
  const apolloAdminClient = useApolloAdminClient();

  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    REGISTRATION_DETAIL_TAB_LIST_ID,
  );

  const { applicationRegistrationId = '' } = useParams<{
    applicationRegistrationId: string;
  }>();

  const { data, loading } = useQuery(
    FindOneAdminApplicationRegistrationDocument,
    {
      client: apolloAdminClient,
      variables: { id: applicationRegistrationId },
      skip: !applicationRegistrationId,
    },
  );

  const registration = data?.findOneAdminApplicationRegistration;

  if (loading || !isDefined(registration)) {
    return null;
  }

  const tabs = [
    { id: 'general', title: t`General`, Icon: IconInfoCircle },
    { id: 'oauth', title: t`OAuth`, Icon: IconKey },
    { id: 'distribution', title: t`Distribution`, Icon: IconWorld },
    { id: 'config', title: t`Config`, Icon: IconSettings },
  ];

  const renderActiveTabContent = () => {
    switch (activeTabId) {
      case 'config':
        return (
          <SettingsApplicationRegistrationConfigTab
            registration={registration}
          />
        );
      case 'oauth':
        return (
          <SettingsApplicationRegistrationOAuthTab
            registration={registration}
          />
        );
      case 'distribution':
        return (
          <SettingsApplicationRegistrationDistributionTab
            registration={registration}
          />
        );
      case 'general':
      default:
        return (
          <SettingsApplicationRegistrationGeneralTab
            registration={registration}
            fromAdmin
          />
        );
    }
  };

  return (
    <SubMenuTopBarContainer
      title={registration.name}
      links={[
        {
          children: t`Other`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: t`Admin Panel - Apps`,
          href: APPLICATION_REGISTRATION_ADMIN_PATH,
        },
        { children: registration.name },
      ]}
    >
      <SettingsPageContainer>
        <TabList
          tabs={tabs}
          componentInstanceId={REGISTRATION_DETAIL_TAB_LIST_ID}
        />
        {renderActiveTabContent()}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
