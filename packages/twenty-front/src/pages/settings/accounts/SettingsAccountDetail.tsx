import { SettingsAccountsCalendarChannelDetails } from '@/settings/accounts/components/SettingsAccountsCalendarChannelDetails';
import { SettingsAccountsMessageChannelDetails } from '@/settings/accounts/components/SettingsAccountsMessageChannelDetails';
import { SettingsConnectedAccountIcon } from '@/settings/accounts/components/SettingsConnectedAccountIcon';
import { SETTINGS_ACCOUNT_GROUP_TAB_LIST_COMPONENT_ID } from '@/settings/consolidated-accounts/constants/SettingsAccountGroupTabListComponentId';
import { useMyAccountGroups } from '@/settings/consolidated-accounts/hooks/useMyAccountGroups';
import { settingsAccountsSelectedMessageChannelState } from '@/settings/accounts/states/settingsAccountsSelectedMessageChannelState';
import { getConnectedAccountSettingsChannels } from '@/settings/consolidated-accounts/utils/getConnectedAccountSettingsChannels';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { Navigate, useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconCalendarEvent, IconMail } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { SettingsAccountsConfigurationSelectedMessageChannelEffect } from '~/pages/settings/accounts/SettingsAccountsConfigurationSelectedMessageChannelEffect';

export const SettingsAccountDetail = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const isConsolidationEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CONNECTED_ACCOUNTS_CONSOLIDATION_ENABLED,
  );
  const { connectedAccountId } = useParams<{ connectedAccountId: string }>();
  const { groups, loading } = useMyAccountGroups();
  const settingsAccountsSelectedMessageChannel = useAtomStateValue(
    settingsAccountsSelectedMessageChannelState,
  );

  const nativeAccount = groups.find(
    (group) => group.nativeAccount?.id === connectedAccountId,
  )?.nativeAccount;
  const { messageChannel, calendarChannel } =
    getConnectedAccountSettingsChannels(nativeAccount);

  const tabs = [
    isDefined(messageChannel)
      ? { id: 'emails', title: t`Emails`, Icon: IconMail }
      : undefined,
    isDefined(calendarChannel)
      ? { id: 'calendar', title: t`Calendar`, Icon: IconCalendarEvent }
      : undefined,
  ].filter(isDefined);

  const activeTabId = useSettingsActiveTabId(
    SETTINGS_ACCOUNT_GROUP_TAB_LIST_COMPONENT_ID,
    tabs.map((tab) => tab.id),
  );

  if (!isConsolidationEnabled || (!loading && tabs.length === 0)) {
    return <Navigate to={getSettingsPath(SettingsPath.Accounts)} replace />;
  }

  const ProviderIcon = isDefined(nativeAccount)
    ? SettingsConnectedAccountIcon({ account: nativeAccount })
    : undefined;

  const renderContent = () => {
    if (activeTabId === 'emails' && isDefined(messageChannel)) {
      return (
        <>
          <SettingsAccountsConfigurationSelectedMessageChannelEffect
            messageChannel={messageChannel}
          />
          {settingsAccountsSelectedMessageChannel?.id === messageChannel.id ? (
            <SettingsAccountsMessageChannelDetails
              messageChannel={messageChannel}
            />
          ) : (
            <SettingsSectionSkeletonLoader />
          )}
        </>
      );
    }

    if (activeTabId === 'calendar' && isDefined(calendarChannel)) {
      return (
        <SettingsAccountsCalendarChannelDetails
          calendarChannel={calendarChannel}
        />
      );
    }

    return <SettingsSectionSkeletonLoader />;
  };

  return (
    <SettingsPageLayout
      title={nativeAccount?.handle}
      icon={
        isDefined(ProviderIcon) ? (
          <ProviderIcon size={theme.icon.size.md} />
        ) : undefined
      }
      links={[
        {
          children: t`User`,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        {
          children: t`Accounts`,
          href: getSettingsPath(SettingsPath.Accounts),
        },
        { children: nativeAccount?.handle },
      ]}
      secondaryBar={
        tabs.length > 0 ? (
          <SettingsTabBar
            aria-label={t`Account settings`}
            tabs={tabs}
            componentInstanceId={SETTINGS_ACCOUNT_GROUP_TAB_LIST_COMPONENT_ID}
          />
        ) : undefined
      }
    >
      <SettingsPageContainer>{renderContent()}</SettingsPageContainer>
    </SettingsPageLayout>
  );
};
