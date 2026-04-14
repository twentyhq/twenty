import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLingui } from '@lingui/react/macro';
import { IconInfoCircle, IconKey, IconWorld } from 'twenty-ui/display';
import { type ApplicationRegistrationData } from '~/pages/settings/applications/tabs/types/ApplicationRegistrationData';
import { SettingsApplicationRegistrationGeneralTab } from '~/pages/settings/applications/tabs/SettingsApplicationRegistrationGeneralTab';
import { SettingsApplicationRegistrationOAuthTab } from '~/pages/settings/applications/tabs/SettingsApplicationRegistrationOAuthTab';
import { SettingsApplicationRegistrationDistributionTab } from '~/pages/settings/applications/tabs/SettingsApplicationRegistrationDistributionTab';

const REGISTRATION_DETAIL_TAB_LIST_ID =
  'application-registration-detail-tab-list';

type SettingsApplicationRegistrationContentProps = {
  registration: ApplicationRegistrationData;
  hasActiveInstalls: boolean;
};

export const SettingsApplicationRegistrationContent = ({
  registration,
  hasActiveInstalls,
}: SettingsApplicationRegistrationContentProps) => {
  const { t } = useLingui();

  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    REGISTRATION_DETAIL_TAB_LIST_ID,
  );

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
    <SettingsPageContainer>
      <TabList
        tabs={tabs}
        componentInstanceId={REGISTRATION_DETAIL_TAB_LIST_ID}
      />
      {renderActiveTabContent()}
    </SettingsPageContainer>
  );
};
