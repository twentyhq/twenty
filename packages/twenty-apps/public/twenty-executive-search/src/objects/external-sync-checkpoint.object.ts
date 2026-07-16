import { defineObject, FieldType } from 'twenty-sdk/define';

export const EXTERNAL_SYNC_CHECKPOINT_UNIVERSAL_IDENTIFIER =
  '9a0b1c2d-3e4f-4a5b-8c7d-8e9f0a1b2c3d';

export const CHECKPOINT_COLLECTION_UID =
  'f1a2b3c4-5d6e-4f7a-8b9c-0d1e2f3a4b01';
export const CHECKPOINT_LAST_SYNCED_AT_UID =
  'f1a2b3c4-5d6e-4f7a-8b9c-0d1e2f3a4b02';
export const CHECKPOINT_CURSOR_UID =
  'f1a2b3c4-5d6e-4f7a-8b9c-0d1e2f3a4b03';

export default defineObject({
  universalIdentifier: EXTERNAL_SYNC_CHECKPOINT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'externalSyncCheckpoint',
  namePlural: 'externalSyncCheckpoints',
  labelSingular: 'External Sync Checkpoint',
  labelPlural: 'External Sync Checkpoints',
  description: 'Per-collection sync progress checkpoint',
  icon: 'IconBookmark',
  labelIdentifierFieldMetadataUniversalIdentifier: CHECKPOINT_COLLECTION_UID,
  fields: [
    {
      universalIdentifier: CHECKPOINT_COLLECTION_UID,
      type: FieldType.TEXT,
      label: 'Collection',
      description: 'Name of the synced collection',
      icon: 'IconDatabase',
      name: 'collection',
    },
    {
      universalIdentifier: CHECKPOINT_LAST_SYNCED_AT_UID,
      type: FieldType.DATE_TIME,
      label: 'Last Synced At',
      description: 'Timestamp of the last successful sync for this collection',
      icon: 'IconClock',
      name: 'lastSyncedAt',
    },
    {
      universalIdentifier: CHECKPOINT_CURSOR_UID,
      type: FieldType.RAW_JSON,
      label: 'Cursor',
      description: 'Pagination or offset cursor for incremental sync',
      icon: 'IconArrowRight',
      isNullable: true,
      defaultValue: null,
      name: 'cursor',
    },
  ],
});
