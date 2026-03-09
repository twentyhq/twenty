import { defineObject, FieldType } from '@/sdk';

export const RECIPIENT_UNIVERSAL_IDENTIFIER =
  'd1a2b3c4-5e6f-4a7b-8c9d-0e1f2a3b4c5d';

export const RECIPIENT_EMAIL_FIELD_UNIVERSAL_IDENTIFIER =
  'd2a2b3c4-5e6f-4a7b-8c9d-0e1f2a3b4c5d';

export default defineObject({
  universalIdentifier: RECIPIENT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'recipient',
  namePlural: 'recipients',
  labelSingular: 'Recipient',
  labelPlural: 'Recipients',
  description: 'A person or organization that receives post cards',
  icon: 'IconUser',
  fields: [
    {
      universalIdentifier: RECIPIENT_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.EMAILS,
      label: 'Email',
      name: 'email',
      icon: 'IconMail',
    },
    {
      universalIdentifier: 'd3a2b3c4-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
      type: FieldType.ADDRESS,
      label: 'Address',
      name: 'address',
      icon: 'IconHome',
    },
  ],
});
