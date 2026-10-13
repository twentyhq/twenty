import { SettingsAccountsCalendarChannelDetails } from '@/settings/accounts/components/SettingsAccountsCalendarChannelDetails';
import { SettingsConnectedAccountIcon } from '@/settings/accounts/components/SettingsConnectedAccountIcon';
import { SETTINGS_ACCOUNT_GROUP_TAB_LIST_COMPONENT_ID } from '@/settings/app-preferences/constants/SettingsAccountGroupTabListComponentId';
import { useMyAccountGroups } from '@/settings/app-preferences/hooks/useMyAccountGroups';
import { getConnectedAccountSettingsChannels } from '@/settings/app-preferences/utils/getConnectedAccountSettingsChannels';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { Navigate, useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconCalendarEvent, IconMail } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { SettingsAppPreferencesSelectedMessageChannelDetails } from '~/pages/settings/accounts/SettingsAppPreferencesSelectedMessageChannelDetails';

export const SettingsAccountDetail = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );
  const { connectedAccountId } = useParams<{ connectedAccountId: string }>();
  const { groups, loading } = useMyAccountGroups();
  const tabListComponentInstanceId = `${SETTINGS_ACCOUNT_GROUP_TAB_LIST_COMPONENT_ID}-${connectedAccountId}`;

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
    tabListComponentInstanceId,
    tabs.map((tab) => tab.id),
  );

  if (!isAppPreferencesEnabled || (!loading && tabs.length === 0)) {
    return <Navigate to={getSettingsPath(SettingsPath.Accounts)} replace />;
  }

  const ProviderIcon = isDefined(nativeAccount)
    ? SettingsConnectedAccountIcon({ account: nativeAccount })
    : undefined;

  const renderContent = () => {
    if (activeTabId === 'emails' && isDefined(messageChannel)) {
      return (
        <SettingsAppPreferencesSelectedMessageChannelDetails
          messageChannel={messageChannel}
        />
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
          children: t`App preferences`,
          href: getSettingsPath(SettingsPath.Accounts),
        },
        { children: nativeAccount?.handle },
      ]}
      secondaryBar={
        tabs.length > 0 ? (
          <SettingsTabBar
            aria-label={t`Account settings`}
            tabs={tabs}
            componentInstanceId={tabListComponentInstanceId}
          />
        ) : undefined
      }
    >
      <SettingsPageContainer>{renderContent()}</SettingsPageContainer>
    </SettingsPageLayout>
  );
};
