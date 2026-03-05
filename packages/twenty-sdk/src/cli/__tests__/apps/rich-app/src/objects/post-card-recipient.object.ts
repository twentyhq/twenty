import { defineObject, FieldType } from '@/sdk';

export const POST_CARD_RECIPIENT_UNIVERSAL_IDENTIFIER =
  'e1a2b3c4-5e6f-4a7b-8c9d-0e1f2a3b4c5e';

export const SENT_AT_FIELD_UNIVERSAL_IDENTIFIER =
  'e2a2b3c4-5e6f-4a7b-8c9d-0e1f2a3b4c5e';

export default defineObject({
  universalIdentifier: POST_CARD_RECIPIENT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'postCardRecipient',
  namePlural: 'postCardRecipients',
  labelSingular: 'Post Card Recipient',
  labelPlural: 'Post Card Recipients',
  description: 'Junction object linking post cards to their recipients',
  icon: 'IconLink',
  fields: [
    {
      universalIdentifier: SENT_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      label: 'Sent at',
      name: 'sentAt',
      icon: 'IconClock',
      isNullable: true,
      defaultValue: null,
    },
  ],
});
