import { SettingsAccountsBlocklistSection } from '@/settings/accounts/components/SettingsAccountsBlocklistSection';
import { SettingsAccountsCalendarChannelDetails } from '@/settings/accounts/components/SettingsAccountsCalendarChannelDetails';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { settingsAccountsSelectedMessageChannelState } from '@/settings/accounts/states/settingsAccountsSelectedMessageChannelState';
import { SettingsAppPreferencesBuiltInAccountsTable } from '@/settings/app-preferences/components/SettingsAppPreferencesBuiltInAccountsTable';
import { SettingsAppPreferencesMessaging } from '@/settings/app-preferences/components/SettingsAppPreferencesMessaging';
import { useBuiltInApps } from '@/settings/app-preferences/hooks/useBuiltInApps';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { SETTINGS_CONTENT_MAX_WIDTH } from '@/settings/constants/SettingsContentMaxWidth';
import { Select } from '@/ui/input/components/Select';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import {
  CalendarChannelSyncStage,
  ConnectedAccountProvider,
  MessageChannelSyncStage,
  MessageChannelType,
  SettingsPath,
} from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconCalendarEvent, IconMail, IconSettings } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Card } from 'twenty-ui/primitives/surfaces';
import { Text } from 'twenty-ui/primitives/typography';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { SettingsAccountsConfigurationSelectedMessageChannelEffect } from '~/pages/settings/accounts/SettingsAccountsConfigurationSelectedMessageChannelEffect';

const StyledSecondaryContent = styled.div`
  width: 100%;
`;

const StyledAccountSelector = styled.div`
  box-sizing: border-box;
  margin: 0 auto;
  max-width: calc(
    ${SETTINGS_CONTENT_MAX_WIDTH}px - ${themeCssVariables.spacing[6]}
  );
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[5]};
  width: 100%;
`;

const StyledEmptyContent = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[4]};
`;

export const SettingsAppPreferencesBuiltInApplication = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const { builtInAppId } = useParams<{ builtInAppId: string }>();
  const { builtInApps } = useBuiltInApps();
  const { accounts, loading } = useMyConnectedAccounts();
  const { triggerApisOAuth } = useTriggerApisOAuth();
  const navigateSettings = useNavigateSettings();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const requestedAccountId = searchParams.get('connectedAccountId');
  const [
    settingsAccountsSelectedMessageChannel,
    setSettingsAccountsSelectedMessageChannel,
  ] = useAtomState(settingsAccountsSelectedMessageChannelState);
  const builtInApp = builtInApps.find(
    (application) => application.id === builtInAppId,
  );

  const appAccounts = accounts.filter(
    (account) => account.provider === builtInApp?.provider,
  );
  const availableAccounts = appAccounts.filter(
    (account) => !isDefined(account.archivedAt),
  );
  const messageChannels = availableAccounts
    .flatMap((account) => account.messageChannels)
    .filter(
      (channel) =>
        channel.type === MessageChannelType.EMAIL &&
        channel.isSyncEnabled &&
        channel.syncStage !== MessageChannelSyncStage.PENDING_CONFIGURATION,
    );
  const calendarChannels = availableAccounts
    .flatMap((account) => account.calendarChannels)
    .filter(
      (channel) =>
        channel.syncStage !== CalendarChannelSyncStage.PENDING_CONFIGURATION,
    );
  const selectedMessageChannel = isDefined(requestedAccountId)
    ? messageChannels.find(
        (channel) => channel.connectedAccountId === requestedAccountId,
      )
    : messageChannels[0];
  const selectedCalendarChannel = isDefined(requestedAccountId)
    ? calendarChannels.find(
        (channel) => channel.connectedAccountId === requestedAccountId,
      )
    : calendarChannels[0];
  const tabs = [
    { id: 'general', title: t`General`, Icon: IconSettings },
    ...(builtInApp?.hasMessaging
      ? [{ id: 'messaging', title: t`Messaging`, Icon: IconMail }]
      : []),
    ...(builtInApp?.hasCalendar
      ? [{ id: 'calendar', title: t`Calendar`, Icon: IconCalendarEvent }]
      : []),
  ];
  const tabComponentInstanceId = `app-preferences-${builtInAppId}`;
  const requestedTabId = location.hash.replace('#', '');
  const activeTabId = tabs.some((tab) => tab.id === requestedTabId)
    ? requestedTabId
    : 'general';
  const preferenceChannels =
    activeTabId === 'messaging' ? messageChannels : calendarChannels;
  const selectedPreferenceChannel =
    activeTabId === 'messaging'
      ? selectedMessageChannel
      : selectedCalendarChannel;

  if (!isDefined(builtInApp)) {
    return (
      <Navigate to={getSettingsPath(SettingsPath.AppPreferences)} replace />
    );
  }

  const handleSelectAccount = (connectedAccountId: string) => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set('connectedAccountId', connectedAccountId);
    navigate({ search: nextSearchParams.toString(), hash: location.hash });
    if (activeTabId === 'messaging') {
      const channel = messageChannels.find(
        (messageChannel) =>
          messageChannel.connectedAccountId === connectedAccountId,
      );
      if (isDefined(channel)) {
        setSettingsAccountsSelectedMessageChannel(channel);
      }
    }
  };
  const handleAddAccount = () => {
    if (builtInApp.provider === ConnectedAccountProvider.IMAP_SMTP_CALDAV) {
      navigateSettings(SettingsPath.NewImapSmtpCaldavConnection);
      return;
    }

    triggerApisOAuth(builtInApp.provider, {
      redirectLocation: getSettingsPath(
        SettingsPath.AppPreferencesBuiltInApplication,
        { builtInAppId: builtInApp.id },
      ),
    });
  };

  return (
    <SettingsPageLayout
      title={builtInApp.name}
      icon={<builtInApp.Icon size={theme.icon.size.md} />}
      links={[
        {
          children: t`Apps`,
          href: getSettingsPath(SettingsPath.AppPreferences),
        },
        { children: builtInApp.name },
      ]}
      secondaryBar={
        <StyledSecondaryContent>
          <SettingsTabBar
            aria-label={t`App preferences tabs`}
            componentInstanceId={tabComponentInstanceId}
            tabs={tabs}
            selectedTabId={activeTabId}
          />
          {activeTabId !== 'general' &&
            isDefined(selectedPreferenceChannel) && (
              <StyledAccountSelector>
                <Select
                  aria-label={t`Account`}
                  label={t`Account`}
                  dropdownId={`app-preferences-account-${builtInApp.id}-${activeTabId}`}
                  dropdownWidthAuto
                  fullWidth
                  value={selectedPreferenceChannel.connectedAccountId}
                  options={availableAccounts
                    .filter((account) =>
                      preferenceChannels.some(
                        (channel) => channel.connectedAccountId === account.id,
                      ),
                    )
                    .map((account) => ({
                      value: account.id,
                      label: account.handle,
                      Icon: builtInApp.Icon,
                    }))}
                  onChange={handleSelectAccount}
                />
              </StyledAccountSelector>
            )}
        </StyledSecondaryContent>
      }
    >
      <SettingsPageContainer>
        {activeTabId === 'general' ? (
          <>
            <Section.Root>
              <Section.Header
                title={t`Accounts`}
                description={t`Shared accounts between apps`}
              />
              {loading ? (
                <SettingsSectionSkeletonLoader />
              ) : (
                <SettingsAppPreferencesBuiltInAccountsTable
                  accounts={appAccounts}
                  onAddAccount={handleAddAccount}
                />
              )}
            </Section.Root>
            <SettingsAccountsBlocklistSection />
          </>
        ) : loading ? (
          <SettingsSectionSkeletonLoader />
        ) : !isDefined(selectedPreferenceChannel) ? (
          <Card.Root rounded>
            <StyledEmptyContent>
              <Text>
                {activeTabId === 'messaging'
                  ? t`Connect an email account in General to configure messaging preferences.`
                  : t`Connect a calendar account in General to configure calendar preferences.`}
              </Text>
              <Button
                render={
                  <Link to={{ search: location.search, hash: '#general' }} />
                }
                variant="outline"
              >{t`Go to General`}</Button>
            </StyledEmptyContent>
          </Card.Root>
        ) : activeTabId === 'messaging' && isDefined(selectedMessageChannel) ? (
          <>
            <SettingsAccountsConfigurationSelectedMessageChannelEffect
              messageChannel={selectedMessageChannel}
            />
            {settingsAccountsSelectedMessageChannel?.id ===
            selectedMessageChannel.id ? (
              <SettingsAppPreferencesMessaging
                key={selectedMessageChannel.id}
                messageChannel={selectedMessageChannel}
              />
            ) : (
              <SettingsSectionSkeletonLoader />
            )}
          </>
        ) : (
          isDefined(selectedCalendarChannel) && (
            <SettingsAccountsCalendarChannelDetails
              key={selectedCalendarChannel.id}
              calendarChannel={selectedCalendarChannel}
            />
          )
        )}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
