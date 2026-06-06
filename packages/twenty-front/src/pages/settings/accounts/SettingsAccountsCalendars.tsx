import { SettingsAccountsCalendarChannelsContainer } from '@/settings/accounts/components/SettingsAccountsCalendarChannelsContainer';
import { SettingsNewAccountSection } from '@/settings/accounts/components/SettingsNewAccountSection';
import { SETTINGS_ACCOUNT_CALENDAR_CHANNELS_TAB_LIST_COMPONENT_ID } from '@/settings/accounts/constants/SettingsAccountCalendarChannelsTabListComponentId';
import { useMyCalendarChannels } from '@/settings/accounts/hooks/useMyCalendarChannels';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { CalendarChannelSyncStage, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/layout';

export const SettingsAccountsCalendars = () => {
  const { t } = useLingui();

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

  const renderContent = () => {
    if (loading) {
      return <SettingsSectionSkeletonLoader />;
    }

    if (calendarChannels.length === 0) {
      return <SettingsNewAccountSection />;
    }

    return (
      <Section>
        <SettingsAccountsCalendarChannelsContainer
          calendarChannels={calendarChannels}
        />
      </Section>
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
