import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import {
  MESSENGER_FILE_ATTACHMENT_TYPES,
  MESSENGER_SHARED_CONTENT_LABELS,
} from 'src/constants/messenger-attachment-labels.constant';
import { type IncomingFileAttachment } from 'src/logic-functions/types/incoming-file-attachment.type';
import {
  type MessengerWebhookAttachment,
  type MessengerWebhookMessage,
} from 'src/logic-functions/types/messenger-webhook.type';

const describeAttachment = (
  attachment: MessengerWebhookAttachment,
): string => {
  const label = MESSENGER_SHARED_CONTENT_LABELS[attachment.type];

  if (!isDefined(label)) {
    return `[Messenger content not supported in Twenty: ${attachment.type}]`;
  }

  const details = [attachment.payload?.title, attachment.payload?.url]
    .filter(isNonEmptyString)
    .join(' ');

  return isNonEmptyString(details) ? `[${label}] ${details}` : `[${label}]`;
};

// a message without text would otherwise show up empty in Twenty
export const buildIncomingMessageContent = (
  message: MessengerWebhookMessage,
): { text: string; fileAttachments: IncomingFileAttachment[] } => {
  const fileAttachments: IncomingFileAttachment[] = [];
  const descriptions: string[] = [];

  for (const [index, attachment] of (message.attachments ?? []).entries()) {
    const url = attachment.payload?.url;

    if (
      MESSENGER_FILE_ATTACHMENT_TYPES.includes(attachment.type) &&
      isNonEmptyString(url)
    ) {
      fileAttachments.push({ url, type: attachment.type, index });
    } else {
      descriptions.push(describeAttachment(attachment));
    }
  }

  return {
    text: [message.text, ...descriptions].filter(isNonEmptyString).join('\n'),
    fileAttachments,
  };
};
