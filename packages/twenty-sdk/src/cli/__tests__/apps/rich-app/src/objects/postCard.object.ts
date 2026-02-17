import { defineObject, FieldType } from '@/sdk';

enum PostCardStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
}

export const POST_CARD_UNIVERSAL_IDENTIFIER =
  '54b589ca-eeed-4950-a176-358418b85c05';

export const CONTENT_FIELD_UNIVERSAL_IDENTIFIER =
  '58a0a314-d7ea-4865-9850-7fb84e72f30b';
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
      universalIdentifier: '87b675b8-dd8c-4448-b4ca-20e5a2234a1e',
      type: FieldType.SELECT,
      label: 'Status',
      icon: 'IconSend',
      defaultValue: `'${PostCardStatus.DRAFT}'`,
      options: [
        {
          value: PostCardStatus.DRAFT,
          label: 'Draft',
          position: 0,
          color: 'gray',
        },
        {
          value: PostCardStatus.SENT,
          label: 'Sent',
          position: 1,
          color: 'orange',
        },
        {
          value: PostCardStatus.DELIVERED,
          label: 'Delivered',
          position: 2,
          color: 'green',
        },
        {
          value: PostCardStatus.RETURNED,
          label: 'Returned',
          position: 3,
          color: 'orange',
        },
      ],
      name: 'status',
    },
    {
      universalIdentifier: 'e06abe72-5b44-4e7f-93be-afc185a3c433',
      type: FieldType.DATE_TIME,
      label: 'Delivered at',
      icon: 'IconCheck',
      isNullable: true,
      defaultValue: null,
      name: 'deliveredAt',
    },
  ],
});
