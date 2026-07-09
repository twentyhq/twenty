import { Injectable } from '@nestjs/common';

import { toPlainText } from '@react-email/render';
import DOMPurify from 'dompurify';
import { MessageChannelType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type ComposeEmailParams } from 'src/engine/core-modules/tool/tools/email-tool/types/compose-email-params.type';
import { type EmailComposerResult } from 'src/engine/core-modules/tool/tools/email-tool/types/email-composer-result.type';
import {
  MessageComposerException,
  MessageComposerExceptionCode,
} from 'src/engine/core-modules/tool/tools/message-composer/exceptions/message-composer.exception';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { parsePhoneHandle } from 'src/utils/parse-phone-handle';

const buildComposerFailure = (message: string): EmailComposerResult => ({
  success: false,
  output: {
    success: false,
    message,
    error: message,
  },
});

const splitCommaSeparatedHandles = (value: string | undefined): string[] =>
  (value ?? '')
    .split(',')
    .map((handle) => handle.trim())
    .filter((handle) => handle.length > 0);

@Injectable()
export class AppMessageComposerService {
  async composeAppMessage({
    parameters,
    connectedAccount,
  }: {
    parameters: ComposeEmailParams;
    connectedAccount: ConnectedAccountEntity;
  }): Promise<EmailComposerResult> {
    const to = splitCommaSeparatedHandles(parameters.recipients?.to);

    if (to.length === 0) {
      return buildComposerFailure('No recipients specified');
    }

    const copyRecipients = [
      ...splitCommaSeparatedHandles(parameters.recipients?.cc),
      ...splitCommaSeparatedHandles(parameters.recipients?.bcc),
    ];

    if (copyRecipients.length > 0) {
      return buildComposerFailure(
        'Cc and Bcc recipients are not supported for app message channels',
      );
    }

    const invalidHandles = to.filter(
      (handle) => !isDefined(parsePhoneHandle(handle)),
    );

    if (invalidHandles.length > 0) {
      return buildComposerFailure(
        `Invalid phone numbers: ${invalidHandles.join(', ')}`,
      );
    }

    if (isNonEmptyArray(parameters.files)) {
      return buildComposerFailure(
        'Attachments are not supported for app message channels',
      );
    }

    const messageChannel = connectedAccount.messageChannels.find(
      (channel) => channel.type === MessageChannelType.APP,
    );

    if (!isDefined(messageChannel)) {
      throw new MessageComposerException(
        `No app message channel found for connected account '${connectedAccount.id}'`,
        MessageComposerExceptionCode.APP_MESSAGE_CHANNEL_NOT_FOUND,
      );
    }

    const { JSDOM } = await import('jsdom');
    const window = new JSDOM('').window;
    const purify = DOMPurify(window);

    const sanitizedHtmlBody = purify.sanitize(parameters.body || '');
    const plainTextBody = toPlainText(sanitizedHtmlBody);
    const sanitizedSubject = purify.sanitize(parameters.subject || '');

    return {
      success: true,
      data: {
        recipients: { to, cc: [], bcc: [] },
        toRecipientsDisplay: to.join(', '),
        sanitizedSubject,
        plainTextBody,
        sanitizedHtmlBody,
        attachments: [],
        connectedAccount,
        messageChannelId: messageChannel.id,
        shouldPersistMessage: true,
        inReplyTo: parameters.inReplyTo,
      },
    };
  }
}
