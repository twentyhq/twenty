import { FieldType, defineObject } from 'twenty-sdk/define';
import {
  PARTNERS_TFT_SYNC_CURSOR_LAST_CURSOR_AT_FIELD_UUID,
  PARTNERS_TFT_SYNC_CURSOR_LAST_CURSOR_ID_FIELD_UUID,
  PARTNERS_TFT_SYNC_CURSOR_LAST_ERROR_FIELD_UUID,
  PARTNERS_TFT_SYNC_CURSOR_LAST_RUN_AT_FIELD_UUID,
  PARTNERS_TFT_SYNC_CURSOR_NAME_FIELD_UUID,
  PARTNERS_TFT_SYNC_CURSOR_OBJECT_UUID,
  PARTNERS_TFT_SYNC_CURSOR_STATUS_FIELD_UUID,
} from 'src/constants/universal-identifiers';

export default defineObject({
  universalIdentifier: PARTNERS_TFT_SYNC_CURSOR_OBJECT_UUID,
  nameSingular: 'tftSyncCursor',
  namePlural: 'tftSyncCursors',
  labelSingular: 'TFT Sync Cursor',
  labelPlural: 'TFT Sync Cursors',
  description: 'Cursor state for the TFT ↔ Partners reconciliation crons — one row per direction, keyed by name: "primary" (forward) and "reverse" (echo backstop) (technical)',
  icon: 'IconBookmark',
  labelIdentifierFieldMetadataUniversalIdentifier: PARTNERS_TFT_SYNC_CURSOR_NAME_FIELD_UUID,
  fields: [
    {
      universalIdentifier: PARTNERS_TFT_SYNC_CURSOR_NAME_FIELD_UUID,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Direction key: "primary" (forward TFT→Partners) or "reverse" (Partners→TFT echo)',
      icon: 'IconAbc',
      // Unique so the cursor is a true per-direction singleton: a concurrent
      // get-or-create loses the create with a unique-violation instead of forking a row.
      // No defaultValue — a unique field can't carry one, and getOrCreateCursor always
      // sets the name explicitly anyway.
      isUnique: true,
    },
    {
      universalIdentifier: PARTNERS_TFT_SYNC_CURSOR_LAST_CURSOR_AT_FIELD_UUID,
      type: FieldType.DATE_TIME,
      name: 'lastCursorAt',
      label: 'Last cursor at',
      description: 'Watermark (timestamp half): pull rows ordered after (lastCursorAt, lastCursorId)',
      icon: 'IconArrowBigRight',
      isNullable: true,
    },
    {
      universalIdentifier: PARTNERS_TFT_SYNC_CURSOR_LAST_CURSOR_ID_FIELD_UUID,
      type: FieldType.TEXT,
      name: 'lastCursorId',
      label: 'Last cursor id',
      description: 'Watermark (id tiebreaker): keyset pagination key so rows sharing a timestamp are never skipped',
      icon: 'IconArrowBigRight',
      isNullable: true,
    },
    {
      universalIdentifier: PARTNERS_TFT_SYNC_CURSOR_LAST_RUN_AT_FIELD_UUID,
      type: FieldType.DATE_TIME,
      name: 'lastRunAt',
      label: 'Last run at',
      description: 'When the reconciliation cron last completed',
      icon: 'IconClock',
      isNullable: true,
    },
    {
      universalIdentifier: PARTNERS_TFT_SYNC_CURSOR_STATUS_FIELD_UUID,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconStatusChange',
      options: [
        { id: 'e8c3f5d1-6a9b-4e3c-9b2f-4d8c3a6f9e1b', value: 'IDLE', label: 'Idle', position: 0, color: 'gray' },
        { id: 'f2d6a8e4-9b3c-4f6d-8c5a-7a2f6e4d1b8c', value: 'RUNNING', label: 'Running', position: 1, color: 'yellow' },
        { id: 'a5e9b1f7-3c6d-4a9b-9e8b-1d4a9c7f3b6e', value: 'FAILED', label: 'Failed', position: 2, color: 'red' },
      ],
    },
    {
      universalIdentifier: PARTNERS_TFT_SYNC_CURSOR_LAST_ERROR_FIELD_UUID,
      type: FieldType.TEXT,
      name: 'lastError',
      label: 'Last error',
      description: 'Error from the most recent failed reconciliation run',
      icon: 'IconAlertCircle',
      isNullable: true,
    },
  ],
});
