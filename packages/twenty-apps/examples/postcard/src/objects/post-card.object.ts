import { defineObject, FieldType } from 'twenty-sdk';

enum PostCardStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
}

export const POST_CARD_UNIVERSAL_IDENTIFIER =
  '54b589ca-eeed-4950-a176-358418b85c05';

export const CONTENT_FIELD_UNIVERSAL_IDENTIFIER =
  'cb9679ff-8f10-4dba-9e75-d571922c6d29';

export const NAME_FIELD_UNIVERSAL_IDENTIFIER =
  'f84f131c-1cfb-4800-916f-7f98e0bdf748';

export default defineObject({
  universalIdentifier: POST_CARD_UNIVERSAL_IDENTIFIER,
  nameSingular: 'postCard',
  namePlural: 'postCards',
  labelSingular: 'Post card',
  labelPlural: 'Post cards',
  description: 'A post card object',
  icon: 'IconMail',
  labelIdentifierFieldMetadataUniversalIdentifier:
    NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Name',
      description: "Postcard's name",
      icon: 'IconAbc',
      name: 'name',
    },
    {
      universalIdentifier: CONTENT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Content',
      description: "Postcard's content",
      icon: 'IconAbc',
      name: 'content',
    },
    {
      universalIdentifier: '87b675b8-dd8c-4448-b4ca-20e5a2234a1e',
      type: FieldType.SELECT,
      label: 'Status',
      icon: 'IconSend',
      defaultValue: `'${PostCardStatus.DRAFT}'`,
      options: [
        {
          id: 'a1b2c3d4-0001-4000-8000-000000000001',
          value: PostCardStatus.DRAFT,
          label: 'Draft',
          position: 0,
          color: 'gray',
        },
        {
          id: 'a1b2c3d4-0002-4000-8000-000000000002',
          value: PostCardStatus.SENT,
          label: 'Sent',
          position: 1,
          color: 'orange',
        },
        {
          id: 'a1b2c3d4-0003-4000-8000-000000000003',
          value: PostCardStatus.DELIVERED,
          label: 'Delivered',
          position: 2,
          color: 'green',
        },
        {
          id: 'a1b2c3d4-0004-4000-8000-000000000004',
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
