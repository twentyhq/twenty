import { isNonEmptyString } from '@sniptt/guards';

import { type LineMessage } from 'src/logic-functions/types/line-webhook.type';

const buildLocationText = ({
  title,
  address,
  latitude,
  longitude,
}: Extract<LineMessage, { type: 'location' }>) =>
  [
    'Location:',
    [title, address].filter(isNonEmptyString).join(', '),
    `(${latitude}, ${longitude})`,
  ]
    .filter(isNonEmptyString)
    .join(' ');

export const buildIncomingMessageText = (message: LineMessage): string => {
  switch (message.type) {
    case 'text':
      return message.text;
    case 'sticker':
      return isNonEmptyString(message.text)
        ? `[Sticker] ${message.text}`
        : '[Sticker]';
    case 'location':
      return buildLocationText(message);
    case 'image':
      return '[Image]';
    case 'video':
      return '[Video]';
    case 'audio':
      return '[Audio]';
    case 'file':
      return `[File] ${message.fileName}`;
  }
};
