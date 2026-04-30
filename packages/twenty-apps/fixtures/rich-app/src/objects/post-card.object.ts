import { defineObject, FieldType } from 'twenty-sdk/define';

enum PostCardStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
  LOST = 'LOST',
}

export const POST_CARD_UNIVERSAL_IDENTIFIER =
  '54b589ca-eeed-4950-a176-358418b85c05';

export const CONTENT_FIELD_UNIVERSAL_IDENTIFIER =
  '58a0a314-d7ea-4865-9850-7fb84e72f30b';

export const STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  '87b675b8-dd8c-4448-b4ca-20e5a2234a1e';

export const DELIVERED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  'e06abe72-5b44-4e7f-93be-afc185a3c433';

export default defineObject({
  universalIdentifier: POST_CARD_UNIVERSAL_IDENTIFIER,
  nameSingular: 'postCard',
  namePlural: 'postCards',
  labelSingular: 'Post card',
  labelPlural: 'Post cards',
  description: 'A post card object',
  icon: 'IconMail',
  labelIdentifierFieldMetadataUniversalIdentifier:
    CONTENT_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: CONTENT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Content',
      description: "Postcard's content",
      icon: 'IconAbc',
      name: 'content',
    },
    {
      universalIdentifier: 'c6aa31f3-da76-4ac6-889f-475e226009ac',
      type: FieldType.FULL_NAME,
      label: 'Recipient name',
      icon: 'IconUser',
      name: 'recipientName',
    },
    {
      universalIdentifier: '95045777-a0ad-49ec-98f9-22f9fc0c8266',
      type: FieldType.ADDRESS,
      label: 'Recipient address',
      icon: 'IconHome',
      name: 'recipientAddress',
    },
    {
      universalIdentifier: STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      label: 'Status',
      icon: 'IconSend',
      defaultValue: `'${PostCardStatus.DRAFT}'`,
      options: [
        {
          id: '1b008e19-1e59-4a07-b187-65a20e547c4e',
          value: PostCardStatus.DRAFT,
          label: 'Draft',
          position: 0,
          color: 'gray',
        },
        {
          id: '452b9d40-889c-4342-9697-98319394db04',
          value: PostCardStatus.SENT,
          label: 'Sent',
          position: 1,
          color: 'orange',
        },
        {
          id: 'c2ed0b8c-a3ed-4383-aef9-e0441267bcfe',
          value: PostCardStatus.DELIVERED,
          label: 'Delivered',
          position: 2,
          color: 'green',
        },
        {
          id: 'c57a5e08-7ef7-49b8-87e6-32d720d22802',
          value: PostCardStatus.RETURNED,
          label: 'Returned',
          position: 3,
          color: 'orange',
        },
        {
          // No id — exercises addMissingFieldOptionIds in the object branch
          value: PostCardStatus.LOST,
          label: 'Lost',
          position: 4,
          color: 'red',
        },
      ],
      name: 'status',
    },
    {
      universalIdentifier: DELIVERED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      label: 'Delivered at',
      icon: 'IconCheck',
      isNullable: true,
      defaultValue: null,
      name: 'deliveredAt',
    },
  ],
});
