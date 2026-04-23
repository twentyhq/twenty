import { Injectable } from '@nestjs/common';

import MailComposer from 'nodemailer/lib/mail-composer';
import { isDefined } from 'twenty-shared/utils';

import { type MessageOutboundDriver } from 'src/modules/messaging/message-outbound-manager/interfaces/message-outbound-driver.interface';

import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { ImapFindDraftsFolderService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-find-drafts-folder.service';
import { SmtpClientProvider } from 'src/modules/messaging/message-import-manager/drivers/smtp/providers/smtp-client.provider';
import { type SendMessageInput } from 'src/modules/messaging/message-outbound-manager/types/send-message-input.type';
import { toMailComposerOptions } from 'src/modules/messaging/message-outbound-manager/utils/to-mail-composer-options.util';

@Injectable()
export class ImapSmtpMessageOutboundService implements MessageOutboundDriver {
  constructor(
    private readonly smtpClientProvider: SmtpClientProvider,
    private readonly imapClientProvider: ImapClientProvider,
    private readonly imapFindDraftsFolderService: ImapFindDraftsFolderService,
  ) {}

  async sendMessage(
    sendMessageInput: SendMessageInput,
    connectedAccount: ConnectedAccountWorkspaceEntity,
  ): Promise<void> {
    const { handle, connectionParameters, messageChannels } = connectedAccount;

    const smtpClient =
      await this.smtpClientProvider.getSmtpClient(connectedAccount);

    this.assertHandleIsDefined(handle);

    const messageBuffer = await this.compileRawMessage(
      handle,
      sendMessageInput,
    );

    await smtpClient.sendMail({
      from: handle,
      to: sendMessageInput.to,
      cc: sendMessageInput.cc,
      bcc: sendMessageInput.bcc,
      raw: messageBuffer,
    });

    if (isDefined(connectionParameters?.IMAP)) {
      const imapClient =
        await this.imapClientProvider.getClient(connectedAccount);

      const messageChannel = messageChannels.find(
        (channel) => channel.handle === handle,
      );

      const sentFolder = messageChannel?.messageFolders.find(
        (messageFolder) => messageFolder.isSentFolder,
      );

      if (isDefined(sentFolder) && isDefined(sentFolder.name)) {
        await imapClient.append(sentFolder.name, messageBuffer);
      }

      await this.imapClientProvider.closeClient(imapClient);
    }
  }

  async createDraft(
    sendMessageInput: SendMessageInput,
    connectedAccount: ConnectedAccountWorkspaceEntity,
  ): Promise<void> {
    const { handle, connectionParameters } = connectedAccount;

    this.assertHandleIsDefined(handle);

    if (!isDefined(connectionParameters?.IMAP)) {
      throw new Error('IMAP connection is required to create drafts');
    }

    const messageBuffer = await this.compileRawMessage(
      handle,
      sendMessageInput,
    );

    const imapClient =
      await this.imapClientProvider.getClient(connectedAccount);

    try {
      const draftsFolder =
        await this.imapFindDraftsFolderService.findOrCreateDraftsFolder(
          imapClient,
        );

      if (!isDefined(draftsFolder)) {
        throw new Error('No drafts folder found and could not create one');
      }
      const DRAFT_FLAG = '\\Draft';

      await imapClient.append(draftsFolder.path, messageBuffer, [DRAFT_FLAG]);
    } finally {
      await this.imapClientProvider.closeClient(imapClient);
    }
  }

  private async compileRawMessage(
    from: string,
    sendMessageInput: SendMessageInput,
  ): Promise<Buffer> {
    const mail = new MailComposer(
      toMailComposerOptions(from, sendMessageInput),
    );

    return mail.compile().build();
  }

  private assertHandleIsDefined(
    handle: string | null,
  ): asserts handle is string {
    if (!isDefined(handle)) {
      throw new Error('Handle is required');
    }
  }
}
