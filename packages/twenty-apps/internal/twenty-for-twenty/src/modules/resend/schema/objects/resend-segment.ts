import {
  RESEND_SEGMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  SEGMENT_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  SEGMENT_LAST_SYNCED_FROM_RESEND_FIELD_UNIVERSAL_IDENTIFIER,
  SEGMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  SEGMENT_RESEND_ID_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/modules/resend/constants/universal-identifiers';
import { defineObject, FieldType } from 'twenty-sdk/define';

export default defineObject({
  universalIdentifier: RESEND_SEGMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'resendSegment',
  namePlural: 'resendSegments',
  labelSingular: 'Resend segment',
  labelPlural: 'Resend segments',
  description: 'A contact segment from Resend',
  icon: 'IconUsersGroup',
  labelIdentifierFieldMetadataUniversalIdentifier:
    SEGMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: SEGMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Name of the segment',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: SEGMENT_RESEND_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'resendId',
      label: 'Resend ID',
      description: 'Resend segment identifier',
      icon: 'IconHash',
    },
    {
      universalIdentifier: SEGMENT_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'createdAt',
      label: 'Created at',
      description: 'When the segment was created',
      icon: 'IconCalendar',
    },
    {
      universalIdentifier:
        SEGMENT_LAST_SYNCED_FROM_RESEND_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'lastSyncedFromResend',
      label: 'Last synced from Resend',
      description: 'Timestamp of last inbound sync (used to prevent echo loops)',
      icon: 'IconClock',
    },
  ],
});
