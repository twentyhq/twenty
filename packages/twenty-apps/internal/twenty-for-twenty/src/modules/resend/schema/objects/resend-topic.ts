import {
  RESEND_TOPIC_OBJECT_UNIVERSAL_IDENTIFIER,
  TOPIC_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  TOPIC_DEFAULT_SUBSCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
  TOPIC_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
  TOPIC_LAST_SYNCED_FROM_RESEND_FIELD_UNIVERSAL_IDENTIFIER,
  TOPIC_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  TOPIC_RESEND_ID_FIELD_UNIVERSAL_IDENTIFIER,
  TOPIC_VISIBILITY_FIELD_UNIVERSAL_IDENTIFIER,
} from '@modules/resend/constants/universal-identifiers';
import { defineObject, FieldType } from 'twenty-sdk/define';

export default defineObject({
  universalIdentifier: RESEND_TOPIC_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'resendTopic',
  namePlural: 'resendTopics',
  labelSingular: 'Resend topic',
  labelPlural: 'Resend topics',
  description: 'A subscription topic from Resend',
  icon: 'IconHash',
  labelIdentifierFieldMetadataUniversalIdentifier:
    TOPIC_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: TOPIC_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Name of the topic',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: TOPIC_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'description',
      label: 'Description',
      description: 'Description of the topic',
      icon: 'IconAlignLeft',
    },
    {
      universalIdentifier: TOPIC_DEFAULT_SUBSCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'defaultSubscription',
      label: 'Default subscription',
      description: 'Whether new contacts are subscribed to this topic by default',
      icon: 'IconUserCheck',
      options: [
        {
          id: '5c7f7114-6b96-49b2-88cc-d43cd87ee110',
          value: 'OPT_IN',
          label: 'Opt in',
          position: 0,
          color: 'green',
        },
        {
          id: 'bff2b98d-7770-4b8f-be0e-ec0294e301df',
          value: 'OPT_OUT',
          label: 'Opt out',
          position: 1,
          color: 'gray',
        },
      ],
    },
    {
      universalIdentifier: TOPIC_VISIBILITY_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'visibility',
      label: 'Visibility',
      description: 'Whether the topic is publicly visible to contacts',
      icon: 'IconEye',
      options: [
        {
          id: 'bdb9d1c3-0cb3-474e-8504-5bc2e1f66731',
          value: 'PUBLIC',
          label: 'Public',
          position: 0,
          color: 'green',
        },
        {
          id: 'b7865f82-a387-48da-bb2d-5492d49ab6ad',
          value: 'PRIVATE',
          label: 'Private',
          position: 1,
          color: 'gray',
        },
      ],
    },
    {
      universalIdentifier: TOPIC_RESEND_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'resendId',
      label: 'Resend ID',
      description: 'Resend topic identifier',
      icon: 'IconHash',
    },
    {
      universalIdentifier: TOPIC_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'createdAt',
      label: 'Created at',
      description: 'When the topic was created',
      icon: 'IconCalendar',
    },
    {
      universalIdentifier:
        TOPIC_LAST_SYNCED_FROM_RESEND_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'lastSyncedFromResend',
      label: 'Last synced from Resend',
      description:
        'Timestamp of last inbound sync (used to prevent echo loops)',
      icon: 'IconClock',
    },
  ],
});
