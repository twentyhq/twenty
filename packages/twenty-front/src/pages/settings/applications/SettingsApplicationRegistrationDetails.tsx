import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconInfoCircle, IconKey, IconWorld } from 'twenty-ui/display';
import {
  FindApplicationRegistrationStatsDocument,
  FindOneApplicationRegistrationDocument,
} from '~/generated-metadata/graphql';
import { type ApplicationRegistrationData } from '~/pages/settings/applications/tabs/types/ApplicationRegistrationData';
import { SettingsApplicationRegistrationGeneralTab } from '~/pages/settings/applications/tabs/SettingsApplicationRegistrationGeneralTab';
import { SettingsApplicationRegistrationOAuthTab } from '~/pages/settings/applications/tabs/SettingsApplicationRegistrationOAuthTab';
import { SettingsApplicationRegistrationDistributionTab } from '~/pages/settings/applications/tabs/SettingsApplicationRegistrationDistributionTab';

const REGISTRATION_DETAIL_TAB_LIST_ID =
  'application-registration-detail-tab-list';

export const SettingsApplicationRegistrationDetails = () => {
  const { t } = useLingui();
  const { applicationRegistrationId = '' } = useParams<{
    applicationRegistrationId: string;
  }>();

  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    REGISTRATION_DETAIL_TAB_LIST_ID,
  );

  const { data, loading } = useQuery(FindOneApplicationRegistrationDocument, {
    variables: { id: applicationRegistrationId },
    skip: !applicationRegistrationId,
  });

  const { data: statsData } = useQuery(FindApplicationRegistrationStatsDocument, {
    variables: { id: applicationRegistrationId },
    skip: !applicationRegistrationId,
  });

  const registration = data?.findOneApplicationRegistration as ApplicationRegistrationData | undefined;
  const stats = statsData?.findApplicationRegistrationStats;
  const hasActiveInstalls = (stats?.activeInstalls ?? 0) > 0;

  if (loading || !isDefined(registration)) {
    return null;
  }

  const tabs = [
    { id: 'general', title: t`General`, Icon: IconInfoCircle },
    { id: 'oauth', title: t`OAuth`, Icon: IconKey },
    { id: 'distribution', title: t`Distribution`, Icon: IconWorld },
  ];

  const renderActiveTabContent = () => {
    switch (activeTabId) {
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
            hasActiveInstalls={hasActiveInstalls}
          />
        );
    }
  };

  return (
    <SubMenuTopBarContainer
      title={registration.name}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: t`Applications`,
          href: getSettingsPath(SettingsPath.Applications),
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
