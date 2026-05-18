import { defineObject, FieldType } from 'twenty-sdk/define';

export const XOPURE_SYNC_MAP_OBJECT_ID = 'c48eed60-ded7-47a1-a51f-59018ed2eba9';

export default defineObject({
  universalIdentifier: XOPURE_SYNC_MAP_OBJECT_ID,
  nameSingular: 'xopureSyncMap',
  namePlural: 'xopureSyncMaps',
  labelSingular: 'XO Pure Sync Map',
  labelPlural: 'XO Pure Sync Maps',
  description: 'Idempotency and cursor state for Supabase-to-Twenty CRM sync.',
  icon: 'IconArrowMerge',
  fields: [
    { universalIdentifier: '92169d19-57e7-4537-82fd-4539c54f7fcb', type: FieldType.TEXT, name: 'syncKey', label: 'Sync key', icon: 'IconFingerprint', isUnique: true },
    { universalIdentifier: 'b221cfa0-d2c1-4a58-bba7-2afb8a840e0f', type: FieldType.TEXT, name: 'sourceSystem', label: 'Source system', icon: 'IconDatabase' },
    { universalIdentifier: '5df7fb5f-50ab-4990-9181-3216d996fdb4', type: FieldType.TEXT, name: 'sourceSchema', label: 'Source schema', icon: 'IconDatabase' },
    { universalIdentifier: '76afbfbb-ffb4-4d82-a8b1-e9fdd0fa7b88', type: FieldType.TEXT, name: 'sourceTable', label: 'Source table', icon: 'IconDatabase' },
    { universalIdentifier: 'ee754f6c-ded5-4b93-931b-9d9fdd62f2d1', type: FieldType.TEXT, name: 'sourceRecordId', label: 'Source record ID', icon: 'IconHash' },
    { universalIdentifier: 'd379db73-6785-413a-a3d9-ed90e6c34fe8', type: FieldType.TEXT, name: 'targetObject', label: 'Target object', icon: 'IconTarget' },
    { universalIdentifier: '4361ae7b-401d-41c2-aa99-76867656d1e2', type: FieldType.TEXT, name: 'targetRecordId', label: 'Target record ID', icon: 'IconHash', isNullable: true, defaultValue: null },
    { universalIdentifier: '5a26fa28-82a2-4c46-8d4b-3ff31725c6ce', type: FieldType.TEXT, name: 'payloadHash', label: 'Payload hash', icon: 'IconFingerprint', isNullable: true, defaultValue: null },
    { universalIdentifier: '120a80c8-51f7-4535-a26d-babeedc391c5', type: FieldType.DATE_TIME, name: 'lastSyncedAt', label: 'Last synced at', icon: 'IconRefresh', isNullable: true, defaultValue: null },
    { universalIdentifier: 'ed0186f7-03fe-4f3a-88fd-3dad7909f602', type: FieldType.TEXT, name: 'lastStatus', label: 'Last status', icon: 'IconProgressCheck' },
    { universalIdentifier: 'b972c9ed-a177-4705-a600-5de7ea2afe42', type: FieldType.TEXT, name: 'lastErrorSummary', label: 'Last error summary', icon: 'IconAlertCircle', isNullable: true, defaultValue: null },
  ],
});
