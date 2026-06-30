import {
  RESEND_SYNC_CURSOR_OBJECT_UNIVERSAL_IDENTIFIER,
  SYNC_CURSOR_CURSOR_FIELD_UNIVERSAL_IDENTIFIER,
  SYNC_CURSOR_LAST_RUN_AT_FIELD_UNIVERSAL_IDENTIFIER,
  SYNC_CURSOR_LAST_RUN_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  SYNC_CURSOR_STEP_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/modules/resend/constants/universal-identifiers';
import { defineObject, FieldType } from 'twenty-sdk/define';

export default defineObject({
  universalIdentifier: RESEND_SYNC_CURSOR_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'resendSyncCursor',
  namePlural: 'resendSyncCursors',
  labelSingular: 'Resend sync cursor',
  labelPlural: 'Resend sync cursors',
  description:
    'Persisted per-step cursor state for the Resend sync (technical object used to resume failed runs)',
  icon: 'IconBookmark',
  labelIdentifierFieldMetadataUniversalIdentifier:
    SYNC_CURSOR_CURSOR_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: SYNC_CURSOR_STEP_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'step',
      label: 'Step',
      description: 'Sync step this cursor tracks',
      icon: 'IconHash',
      isUnique: true,
      options: [
        {
          id: 'c271f363-c680-446b-9318-06970b9af137',
          value: 'SEGMENTS',
          label: 'Segments',
          position: 0,
          color: 'gray',
        },
        {
          id: '7b63e182-8124-4085-ad17-9f2f3c9988e5',
          value: 'TEMPLATES',
          label: 'Templates',
          position: 1,
          color: 'blue',
        },
        {
          id: '0dd5ce53-94ec-4d1e-9ef5-5642d69922fe',
          value: 'CONTACTS',
          label: 'Contacts',
          position: 2,
          color: 'green',
        },
        {
          id: 'c9b5dc16-74f4-46d1-bfcd-010e46ab62e6',
          value: 'EMAILS',
          label: 'Emails',
          position: 3,
          color: 'purple',
        },
        {
          id: 'da6acca3-1341-42d3-a21c-aa18905d7536',
          value: 'BROADCASTS',
          label: 'Broadcasts',
          position: 4,
          color: 'orange',
        },
        {
          id: 'abec7a2d-20c5-4304-9356-7cf05db67a71',
          value: 'TOPICS',
          label: 'Topics',
          position: 5,
          color: 'pink',
        },
      ],
    },
    {
      universalIdentifier: SYNC_CURSOR_CURSOR_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'cursor',
      label: 'Cursor',
      description:
        'Last successfully processed Resend ID; empty when not in progress',
      icon: 'IconArrowBigRight',
    },
    {
      universalIdentifier: SYNC_CURSOR_LAST_RUN_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'lastRunAt',
      label: 'Last run at',
      description: 'Timestamp of the most recent sync run for this step',
      icon: 'IconClock',
    },
    {
      universalIdentifier:
        SYNC_CURSOR_LAST_RUN_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'lastRunStatus',
      label: 'Last run status',
      description: 'Outcome of the most recent sync run for this step',
      icon: 'IconActivity',
      options: [
        {
          id: 'b8e6cc9c-3b1f-4a6c-9f2c-77c5e1f0c8b1',
          value: 'SUCCESS',
          label: 'Success',
          position: 0,
          color: 'green',
        },
        {
          id: '6a8d7c44-cb5b-4d4d-b6d6-6e02e1f0aa12',
          value: 'FAILED',
          label: 'Failed',
          position: 1,
          color: 'red',
        },
        {
          id: 'c8d2bea1-0c5f-4b78-95cf-2f1de4d2f0a3',
          value: 'IN_PROGRESS',
          label: 'In progress',
          position: 2,
          color: 'yellow',
        },
      ],
    },
  ],
});
