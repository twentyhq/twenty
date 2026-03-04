import { defineObject, FieldType } from 'twenty-sdk';

const POST_CARD_STATUS = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  RETURNED: 'RETURNED',
} as const;

export default defineObject({
  universalIdentifier: '54b589ca-eeed-4950-a176-358418b85c05',
  nameSingular: 'postCard',
  namePlural: 'postCards',
  labelSingular: 'Post card',
  labelPlural: 'Post cards',
  description: 'A post card object',
  icon: 'IconMail',
  fields: [
    {
      universalIdentifier: '58a0a314-d7ea-4865-9850-7fb84e72f30b',
      type: FieldType.TEXT,
      name: 'content',
      label: 'Content',
      description: "Postcard's content",
      icon: 'IconAbc',
    },
    {
      universalIdentifier: 'c6aa31f3-da76-4ac6-889f-475e226009ac',
      type: FieldType.FULL_NAME,
      name: 'recipientName',
      label: 'Recipient name',
      icon: 'IconUser',
    },
    {
      universalIdentifier: '95045777-a0ad-49ec-98f9-22f9fc0c8266',
      type: FieldType.ADDRESS,
      name: 'recipientAddress',
      label: 'Recipient address',
      icon: 'IconHome',
    },
    {
      universalIdentifier: '87b675b8-dd8c-4448-b4ca-20e5a2234a1e',
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconSend',
      defaultValue: `'${POST_CARD_STATUS.DRAFT}'`,
      options: [
        {
          id: 'a1b2c3d4-0001-4000-8000-000000000001',
          value: POST_CARD_STATUS.DRAFT,
          label: 'Draft',
          position: 0,
          color: 'gray',
        },
        {
          id: 'a1b2c3d4-0002-4000-8000-000000000002',
          value: POST_CARD_STATUS.SENT,
          label: 'Sent',
          position: 1,
          color: 'orange',
        },
        {
          id: 'a1b2c3d4-0003-4000-8000-000000000003',
          value: POST_CARD_STATUS.DELIVERED,
          label: 'Delivered',
          position: 2,
          color: 'green',
        },
        {
          id: 'a1b2c3d4-0004-4000-8000-000000000004',
          value: POST_CARD_STATUS.RETURNED,
          label: 'Returned',
          position: 3,
          color: 'orange',
        },
      ],
    },
    {
      universalIdentifier: 'e06abe72-5b44-4e7f-93be-afc185a3c433',
      type: FieldType.DATE_TIME,
      name: 'deliveredAt',
      label: 'Delivered at',
      icon: 'IconCheck',
      isNullable: true,
      defaultValue: null,
    },
  ],
});
