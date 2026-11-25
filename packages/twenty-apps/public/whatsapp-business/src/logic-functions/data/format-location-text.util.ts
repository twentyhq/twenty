import { isNonEmptyString } from '@sniptt/guards';
import { type WhatsAppWebhookMessageContent } from 'src/logic-functions/types/whatsapp-webhook-message.type';

type Location = Extract<WhatsAppWebhookMessageContent, { type: 'location' }>['location'];

export const formatLocationText = (location: Location): string =>
  [
    location.name,
    location.address,
    `${location.latitude}, ${location.longitude}`,
    location.url,
  ]
    .filter(isNonEmptyString)
    .join('\n');
