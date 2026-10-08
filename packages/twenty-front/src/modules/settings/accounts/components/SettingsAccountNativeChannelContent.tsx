import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { SettingsAccountsCalendarChannelDetails } from '@/settings/accounts/components/SettingsAccountsCalendarChannelDetails';
import { SettingsAccountsMessageChannelDetails } from '@/settings/accounts/components/SettingsAccountsMessageChannelDetails';
import { useConnectedAccountAdministration } from '@/settings/accounts/hooks/useConnectedAccountAdministration';
import { settingsAccountsSelectedMessageChannelState } from '@/settings/accounts/states/settingsAccountsSelectedMessageChannelState';
import { type ConsolidatedConnectedAccount } from '@/settings/accounts/types/ConsolidatedConnectedAccount';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { Link } from 'react-router-dom';
import {
  CalendarChannelSyncStage,
  MessageChannelSyncStage,
  SettingsPath,
} from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Button } from 'twenty-ui/primitives/input';
import {
  CalendarChannelVisibility,
  MessageChannelVisibility,
} from '~/generated-metadata/graphql';
import { SettingsAccountsConfigurationSelectedMessageChannelEffect } from '~/pages/settings/accounts/SettingsAccountsConfigurationSelectedMessageChannelEffect';

type SettingsAccountNativeChannelContentProps = {
  account: ConsolidatedConnectedAccount;
  messageChannel?: MessageChannel;
  calendarChannel?: CalendarChannel;
};

export const SettingsAccountNativeChannelContent = ({
  account,
  messageChannel,
  calendarChannel,
}: SettingsAccountNativeChannelContentProps) => {
  const { t } = useLingui();
  const { canManageAccount } = useConnectedAccountAdministration();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const settingsAccountsSelectedMessageChannel = useAtomStateValue(
    settingsAccountsSelectedMessageChannelState,
  );
  const isOwner =
    account.userWorkspaceId === currentWorkspaceMember?.userWorkspaceId;
  const hasPendingConfiguration =
    messageChannel?.syncStage ===
      MessageChannelSyncStage.PENDING_CONFIGURATION ||
    calendarChannel?.syncStage ===
      CalendarChannelSyncStage.PENDING_CONFIGURATION;

  if (isDefined(account.archivedAt) || hasPendingConfiguration) {
    return (
      <>
        <InlineBanner status="info" layout="compact">
          {hasPendingConfiguration
            ? t`Complete this connection's setup to configure its preferences.`
            : t`Reconnect this connection to configure its preferences.`}
        </InlineBanner>
        {hasPendingConfiguration && isOwner && (
          <Button
            variant="outline"
            href={getSettingsPath(SettingsPath.AccountsConfiguration, {
              connectedAccountId: account.id,
            })}
            render={
              <Link
                to={getSettingsPath(SettingsPath.AccountsConfiguration, {
                  connectedAccountId: account.id,
                })}
              />
            }
          >{t`Complete setup`}</Button>
        )}
      </>
    );
  }
  if (
    (isDefined(calendarChannel) && !isOwner) ||
    (isDefined(messageChannel) && !canManageAccount(account))
  ) {
    const isMetadataOnly =
      calendarChannel?.visibility === CalendarChannelVisibility.METADATA ||
      messageChannel?.visibility === MessageChannelVisibility.METADATA;

    return (
      <>
        <InlineBanner
          status="info"
          layout="compact"
        >{t`This shared connection's preferences are managed by its owner.`}</InlineBanner>
        <span>
          {t`Visibility`}:{' '}
          {isMetadataOnly
            ? t`Metadata`
            : messageChannel?.visibility === MessageChannelVisibility.SUBJECT
              ? t`Subject and metadata`
              : t`Everything`}
        </span>
      </>
    );
  }

  return (
    <>
      {(messageChannel?.isSyncEnabled === false ||
        calendarChannel?.isSyncEnabled === false) && (
        <InlineBanner
          status="info"
          layout="compact"
        >{t`Syncing is paused for this connection.`}</InlineBanner>
      )}
      {isDefined(calendarChannel) && (
        <SettingsAccountsCalendarChannelDetails
          calendarChannel={calendarChannel}
        />
      )}
      {isDefined(messageChannel) && (
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
      )}
    </>
  );
};
