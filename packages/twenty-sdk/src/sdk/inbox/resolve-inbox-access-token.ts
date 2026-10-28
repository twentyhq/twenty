import { isNonEmptyString } from '@sniptt/guards';
import { type InboxMessageSender } from 'twenty-shared/application';
import {
  DEFAULT_APP_ACCESS_TOKEN_NAME,
  DEFAULT_APP_APPLICATION_ACCESS_TOKEN_NAME,
} from 'twenty-shared/application-runtime';

import { getApplicationAccessToken } from '@/sdk/utils/get-application-access-token';

export const resolveInboxAccessToken = (sender: InboxMessageSender): string => {
  if (sender === 'APPLICATION') {
    const applicationAccessToken = getApplicationAccessToken();

    if (!isNonEmptyString(applicationAccessToken)) {
      throw new Error(
        `Inbox helpers need ${DEFAULT_APP_APPLICATION_ACCESS_TOKEN_NAME} or ${DEFAULT_APP_ACCESS_TOKEN_NAME}, which Twenty sets in logic functions and front components.`,
      );
    }

    return applicationAccessToken;
  }

  const currentMemberAccessToken = process.env[DEFAULT_APP_ACCESS_TOKEN_NAME];
  const isCurrentMemberBehindRun =
    isNonEmptyString(currentMemberAccessToken) &&
    currentMemberAccessToken !==
      process.env[DEFAULT_APP_APPLICATION_ACCESS_TOKEN_NAME];

  if (!isCurrentMemberBehindRun) {
    throw new Error(
      "sender 'CURRENT_MEMBER' needs a workspace member behind the run. Cron schedules, install hooks and unauthenticated webhooks run with nobody behind them, so send those messages as 'APPLICATION'.",
    );
  }

  return currentMemberAccessToken;
};
