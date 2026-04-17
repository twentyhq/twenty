import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLingui } from '@lingui/react/macro';
import {
  IconInfoCircle,
  IconKey,
  IconSettings,
  IconWorld,
} from 'twenty-ui/display';
import { SettingsApplicationRegistrationGeneralTab } from '~/pages/settings/applications/tabs/SettingsApplicationRegistrationGeneralTab';
import { SettingsApplicationRegistrationOAuthTab } from '~/pages/settings/applications/tabs/SettingsApplicationRegistrationOAuthTab';
import { SettingsApplicationRegistrationDistributionTab } from '~/pages/settings/applications/tabs/SettingsApplicationRegistrationDistributionTab';
import { type ApplicationRegistration } from '~/generated-metadata/graphql';
import { SettingsApplicationRegistrationConfigTab } from '~/pages/settings/applications/tabs/SettingsApplicationRegistrationConfigTab';

const REGISTRATION_DETAIL_TAB_LIST_ID =
  'application-registration-detail-tab-list';

type SettingsApplicationRegistrationContentProps = {
  registration: ApplicationRegistration;
};

export const SettingsApplicationRegistrationContent = ({
  registration,
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
