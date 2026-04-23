import { Injectable } from '@nestjs/common';

import { batchFetchImplementation } from '@jrmdayn/googleapis-batcher';
import { isNonEmptyString } from '@sniptt/guards';
import { type gmail_v1 as gmailV1, google } from 'googleapis';
import { isDefined } from 'twenty-shared/utils';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  type MessageChannelWorkspaceEntity,
  MessageFolderImportPolicy,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { GmailMessagesImportErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-messages-import-error-handler.service';
import { filterGmailMessagesByFolderPolicy } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/filter-gmail-messages-by-folder-policy.util';
import { parseAndFormatGmailMessage } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-and-format-gmail-message.util';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';

const GMAIL_BATCH_REQUEST_MAX_SIZE = 50;

@Injectable()
export class GmailGetMessagesService {
  constructor(
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
    private readonly gmailMessagesImportErrorHandler: GmailMessagesImportErrorHandler,
  ) {}

  async getMessages(
    messageIds: string[],
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      | 'provider'
      | 'accessToken'
      | 'refreshToken'
      | 'id'
      | 'handle'
      | 'handleAliases'
    >,
    messageChannel: Pick<
      MessageChannelWorkspaceEntity,
      'messageFolders' | 'messageFolderImportPolicy'
    >,
  ): Promise<MessageWithParticipants[]> {
    const oAuth2Client =
      await this.oAuth2ClientManagerService.getGoogleOAuth2Client(
        connectedAccount,
      );

    const batchedFetchImplementation = batchFetchImplementation({
      maxBatchSize: GMAIL_BATCH_REQUEST_MAX_SIZE,
    });

    const batchedGmailClient = google.gmail({
      version: 'v1',
      auth: oAuth2Client,
      fetchImplementation: batchedFetchImplementation,
    });

    const fetchedMessages = await this.fetchMessages(
      batchedGmailClient,
      messageIds,
      connectedAccount,
    );

    const filteredMessages = filterGmailMessagesByFolderPolicy(
      fetchedMessages,
      messageChannel,
    );

    if (
      messageChannel.messageFolderImportPolicy !==
      MessageFolderImportPolicy.SELECTED_FOLDERS
    ) {
      return filteredMessages;
    }

    const syncedLabelIds = (messageChannel.messageFolders ?? [])
      .filter(
        (folder) => folder.isSynced && isNonEmptyString(folder.externalId),
      )
      .map((folder) => folder.externalId as string);

    if (syncedLabelIds.length === 0) {
      return filteredMessages;
    }

    const fetchedMessageIds = new Set(
      fetchedMessages.map((message) => message.externalId),
    );
    const filteredMessageIds = new Set(
      filteredMessages.map((message) => message.externalId),
    );
    const excludedMessageIds = new Set(
      fetchedMessages
        .filter((message) => !filteredMessageIds.has(message.externalId))
        .map((message) => message.externalId),
    );

    const threadIds = [
      ...new Set(
        fetchedMessages
          .map((message) => message.messageThreadExternalId)
          .filter(isNonEmptyString),
      ),
    ];

    const matchingThreadIds = new Set<string>();
    const missingMessageIds: string[] = [];

    await Promise.all(
      threadIds.map((threadId) =>
        batchedGmailClient.users.threads
          .get({
            userId: 'me',
            id: threadId,
            format: 'metadata',
            metadataHeaders: [],
          })
          .then((response) => {
            const threadMessages = response.data.messages ?? [];

            const threadHasSyncedLabel = threadMessages.some(
              (threadMessage) =>
                !excludedMessageIds.has(threadMessage.id ?? '') &&
                (threadMessage.labelIds ?? []).some((labelId) =>
                  syncedLabelIds.includes(labelId),
                ),
            );

            if (!threadHasSyncedLabel) {
              return;
            }

            matchingThreadIds.add(threadId);

            for (const threadMessage of threadMessages) {
              if (
                isNonEmptyString(threadMessage.id) &&
                !fetchedMessageIds.has(threadMessage.id)
              ) {
                missingMessageIds.push(threadMessage.id);
              }
            }
          })
          .catch((error) => {
            this.gmailMessagesImportErrorHandler.handleError(error, threadId);
          }),
      ),
    );

    const threadSiblings =
      missingMessageIds.length > 0
        ? await this.fetchMessages(
            batchedGmailClient,
            missingMessageIds,
            connectedAccount,
          )
        : [];

    const includedMessages = fetchedMessages.filter(
      (message) =>
        filteredMessageIds.has(message.externalId) ||
        matchingThreadIds.has(message.messageThreadExternalId),
    );

    return [...includedMessages, ...threadSiblings];
  }

  private async fetchMessages(
    gmailClient: gmailV1.Gmail,
    messageIds: string[],
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'handle' | 'handleAliases'
    >,
  ): Promise<MessageWithParticipants[]> {
    const results = await Promise.all(
      messageIds.map((messageId) =>
        gmailClient.users.messages
          .get({ userId: 'me', id: messageId })
          .then((response) => ({ messageId, data: response.data, error: null }))
          .catch((error) => ({ messageId, data: null, error })),
      ),
    );

    return results
      .map(({ messageId, data, error }) => {
        if (error) {
          this.gmailMessagesImportErrorHandler.handleError(error, messageId);

          return undefined;
        }

        return parseAndFormatGmailMessage(
          data as gmailV1.Schema$Message,
          connectedAccount,
        );
      })
      .filter(isDefined);
  }
}
