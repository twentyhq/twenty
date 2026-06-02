import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useQuery } from '@apollo/client/react';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { FindOneApplicationRegistrationDocument } from '~/generated-metadata/graphql';
import { useLingui } from '@lingui/react/macro';
import { Tag } from 'twenty-ui/components';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import {
  Avatar,
  IconInfoCircle,
  IconKey,
  IconSettings,
  IconWorld,
} from 'twenty-ui/display';
import { SettingsApplicationRegistrationConfigTab } from '~/pages/settings/applications/tabs/SettingsApplicationRegistrationConfigTab';
import { SettingsApplicationRegistrationOAuthTab } from '~/pages/settings/applications/tabs/SettingsApplicationRegistrationOAuthTab';
import { SettingsApplicationRegistrationDistributionTab } from '~/pages/settings/applications/tabs/SettingsApplicationRegistrationDistributionTab';
import { SettingsApplicationRegistrationGeneralTab } from '~/pages/settings/applications/tabs/SettingsApplicationRegistrationGeneralTab';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const REGISTRATION_DETAIL_TAB_LIST_ID =
  'application-registration-detail-tab-list';

const StyledTitleContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

export const SettingsApplicationRegistrationDetails = () => {
  const { t } = useLingui();

  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    REGISTRATION_DETAIL_TAB_LIST_ID,
  );

  const { applicationRegistrationId = '' } = useParams<{
    applicationRegistrationId: string;
  }>();

  const { data, loading } = useQuery(FindOneApplicationRegistrationDocument, {
    variables: { id: applicationRegistrationId },
    skip: !applicationRegistrationId,
  });

  const registration = data?.findOneApplicationRegistration;

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
          />
        );
    }
  };

  return (
    <SettingsPageLayout
      title={
        <StyledTitleContainer>
          <Avatar
            type="app"
            size="md"
            avatarUrl={registration.logoUrl ?? undefined}
            placeholder={registration.name}
            placeholderColorSeed={registration.name}
          />
          {registration.name}
        </StyledTitleContainer>
      }
      tag={<Tag text={t`Owner`} color={'gray'} />}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        {
          children: t`Applications - Developer`,
          href: getSettingsPath(
            SettingsPath.Applications,
            undefined,
            undefined,
            'developer',
          ),
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
    </SettingsPageLayout>
  );
};
