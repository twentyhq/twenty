import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type gmail_v1 } from 'googleapis';

import { MESSAGING_GMAIL_USERS_HISTORY_MAX_RESULT } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-users-history-max-result.constant';
import { GmailMessageListFetchErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-message-list-fetch-error-handler.service';

@Injectable()
export class GmailGetHistoryService {
  constructor(
    private readonly gmailMessageListFetchErrorHandler: GmailMessageListFetchErrorHandler,
  ) {}

  public async getHistory(
    gmailClient: gmail_v1.Gmail,
    lastSyncHistoryId: string,
  ): Promise<{
    history: gmail_v1.Schema$History[];
    historyId?: string | null;
  }> {
    const fullHistory: gmail_v1.Schema$History[] = [];
    let pageToken: string | undefined;
    let hasMoreMessages = true;
    let nextHistoryId: string | undefined;

    while (hasMoreMessages) {
      const response = await gmailClient.users.history
        .list({
          userId: 'me',
          maxResults: MESSAGING_GMAIL_USERS_HISTORY_MAX_RESULT,
          pageToken,
          startHistoryId: lastSyncHistoryId,
          historyTypes: [
            'messageAdded',
            'messageDeleted',
            'labelAdded',
            'labelRemoved',
          ],
        })
        .catch((error) => {
          this.gmailMessageListFetchErrorHandler.handleError(error);

          return {
            data: {
              history: [],
              historyId: lastSyncHistoryId,
              nextPageToken: undefined,
            },
          };
        });

      nextHistoryId = response?.data?.historyId ?? undefined;

      if (response?.data?.history) {
        fullHistory.push(...response.data.history);
      }

      pageToken = response?.data?.nextPageToken ?? undefined;
      hasMoreMessages = !!pageToken;
    }

    return { history: fullHistory, historyId: nextHistoryId };
  }

  public async getMessageIdsFromHistory(
    history: gmail_v1.Schema$History[],
  ): Promise<{
    messagesAdded: string[];
    messagesDeleted: string[];
  }> {
    const { messagesAdded, messagesDeleted } = history.reduce(
      (
        acc: {
          messagesAdded: string[];
          messagesDeleted: string[];
        },
        history,
      ) => {
        const messagesAdded = history.messagesAdded?.map(
          (messageAdded) => messageAdded.message?.id || '',
        );
        const labelsAdded = history.labelsAdded?.map(
          (labelAdded) => labelAdded.message?.id || '',
        );

        const messagesDeleted = history.messagesDeleted?.map(
          (messageDeleted) => messageDeleted.message?.id || '',
        );

        if (messagesAdded) acc.messagesAdded.push(...messagesAdded);
        if (labelsAdded) acc.messagesAdded.push(...labelsAdded);
        if (messagesDeleted) acc.messagesDeleted.push(...messagesDeleted);

        return acc;
      },
      { messagesAdded: [], messagesDeleted: [] },
    );

    const uniqueMessagesAdded = messagesAdded.filter(
      (messageId) =>
        isNonEmptyString(messageId) && !messagesDeleted.includes(messageId),
    );

    const uniqueMessagesDeleted = messagesDeleted.filter(
      (messageId) =>
        isNonEmptyString(messageId) && !messagesAdded.includes(messageId),
    );

    return {
      messagesAdded: [...new Set(uniqueMessagesAdded)],
      messagesDeleted: [...new Set(uniqueMessagesDeleted)],
    };
  }
}
