import { isNonEmptyString } from '@sniptt/guards';
import { type WhatsAppWebhookMessageContent } from 'src/logic-functions/types/whatsapp-webhook-message.type';

type SharedContacts = NonNullable<
  Extract<WhatsAppWebhookMessageContent, { type: 'contacts' }>['contacts']
>;

export const formatSharedContactsText = (sharedContacts: SharedContacts): string =>
  sharedContacts
    .map((sharedContact) =>
      [
        sharedContact.name?.formatted_name,
        ...(sharedContact.phones ?? []).map(({ phone }) => phone),
        ...(sharedContact.emails ?? []).map(({ email }) => email),
      ]
        .filter(isNonEmptyString)
        .join('\n'),
    )
    .join('\n\n');
