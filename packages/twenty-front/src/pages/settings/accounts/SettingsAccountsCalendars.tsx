import { SettingsAccountsCalendarChannelsContainer } from '@/settings/accounts/components/SettingsAccountsCalendarChannelsContainer';
import { SettingsNewAccountSection } from '@/settings/accounts/components/SettingsNewAccountSection';
import { SETTINGS_ACCOUNT_CALENDAR_CHANNELS_TAB_LIST_COMPONENT_ID } from '@/settings/accounts/constants/SettingsAccountCalendarChannelsTabListComponentId';
import { useMyCalendarChannels } from '@/settings/accounts/hooks/useMyCalendarChannels';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { CalendarChannelSyncStage, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const SettingsAccountsCalendars = () => {
  const { t } = useLingui();
  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );

  const { channels: allCalendarChannels, loading } = useMyCalendarChannels();

  const calendarChannels = useMemo(
    () =>
      allCalendarChannels.filter(
        (channel) =>
          channel.syncStage !== CalendarChannelSyncStage.PENDING_CONFIGURATION,
      ),
    [allCalendarChannels],
  );

  const tabs = calendarChannels.map((calendarChannel) => ({
    id: calendarChannel.id,
    title: calendarChannel.handle,
  }));

  if (isAppPreferencesEnabled) {
    return <Navigate to={getSettingsPath(SettingsPath.Accounts)} replace />;
  }

  const renderContent = () => {
    if (loading) {
      return <SettingsSectionSkeletonLoader />;
    }

    if (calendarChannels.length === 0) {
      return <SettingsNewAccountSection />;
    }

    return (
      <Section.Root>
        <SettingsAccountsCalendarChannelsContainer
          calendarChannels={calendarChannels}
        />
      </Section.Root>
    );
  };

  return (
    <SettingsPageLayout
      title={t`Calendars`}
      links={[
        {
          children: t`User`,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        {
          children: t`Accounts`,
          href: getSettingsPath(SettingsPath.Accounts),
        },
        { children: t`Calendars` },
      ]}
      secondaryBar={
        tabs.length > 1 ? (
          <SettingsTabBar
            aria-label={t`Calendar accounts`}
            tabs={tabs}
            componentInstanceId={
              SETTINGS_ACCOUNT_CALENDAR_CHANNELS_TAB_LIST_COMPONENT_ID
            }
          />
        ) : undefined
      }
    >
      <SettingsPageContainer>{renderContent()}</SettingsPageContainer>
    </SettingsPageLayout>
  );
};
