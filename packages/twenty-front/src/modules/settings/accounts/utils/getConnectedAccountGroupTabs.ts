import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { type ConnectedAccountGroupTab } from '@/settings/accounts/types/ConnectedAccountGroupTab';
import { type ConsolidatedConnectedAccount } from '@/settings/accounts/types/ConsolidatedConnectedAccount';
import {
  ConnectedAccountProvider,
  MessageChannelType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getConnectedAccountGroupTabs = ({
  accounts,
  messageChannels,
  calendarChannels,
}: {
  accounts: Pick<
    ConsolidatedConnectedAccount,
    'id' | 'provider' | 'applicationId'
  >[];
  messageChannels: Pick<MessageChannel, 'id' | 'connectedAccountId' | 'type'>[];
  calendarChannels: Pick<CalendarChannel, 'id' | 'connectedAccountId'>[];
}): ConnectedAccountGroupTab[] => {
  const tabs: ConnectedAccountGroupTab[] = [];

  for (const provider of [
    ConnectedAccountProvider.GOOGLE,
    ConnectedAccountProvider.MICROSOFT,
    ConnectedAccountProvider.IMAP_SMTP_CALDAV,
    ConnectedAccountProvider.EMAIL_GROUP,
  ]) {
    const providerAccounts = accounts.filter(
      (account) => account.provider === provider,
    );
    const accountIds = new Set(providerAccounts.map((account) => account.id));
    const emails = messageChannels.filter(
      (channel) =>
        accountIds.has(channel.connectedAccountId) &&
        (channel.type === MessageChannelType.EMAIL ||
          (provider === ConnectedAccountProvider.EMAIL_GROUP &&
            channel.type === MessageChannelType.EMAIL_GROUP)),
    );
    const calendars = calendarChannels.filter((channel) =>
      accountIds.has(channel.connectedAccountId),
    );

    if (emails.length > 0) {
      tabs.push({
        id: `email-${provider}`,
        type: 'email',
        provider,
        connectedAccountIds: providerAccounts
          .filter((account) =>
            emails.some((channel) => channel.connectedAccountId === account.id),
          )
          .map((account) => account.id),
        channelIds: emails.map((channel) => channel.id),
      });
    }
    if (calendars.length > 0) {
      tabs.push({
        id: `calendar-${provider}`,
        type: 'calendar',
        provider,
        connectedAccountIds: providerAccounts
          .filter((account) =>
            calendars.some(
              (channel) => channel.connectedAccountId === account.id,
            ),
          )
          .map((account) => account.id),
        channelIds: calendars.map((channel) => channel.id),
      });
    }
  }

  for (const account of accounts) {
    if (
      account.provider !== ConnectedAccountProvider.APP ||
      !isDefined(account.applicationId)
    ) {
      continue;
    }
    const tabId = `app-${account.applicationId}`;
    const existingTab = tabs.find((tab) => tab.id === tabId);

    if (isDefined(existingTab)) {
      existingTab.connectedAccountIds.push(account.id);
    } else {
      tabs.push({
        id: tabId,
        type: 'app',
        applicationId: account.applicationId,
        connectedAccountIds: [account.id],
      });
    }
  }

  const boundIds = new Set(tabs.flatMap((tab) => tab.connectedAccountIds));
  const unboundIds = accounts
    .filter((account) => !boundIds.has(account.id))
    .map((account) => account.id);

  if (unboundIds.length > 0) {
    tabs.push({
      id: 'connection',
      type: 'connection',
      connectedAccountIds: unboundIds,
    });
  }

  return tabs;
};
