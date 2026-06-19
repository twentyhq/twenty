import { defineView, ViewType } from 'twenty-sdk/define';

import {
  XOPURE_SYNC_MAP_LAST_ERROR_SUMMARY_FIELD_ID,
  XOPURE_SYNC_MAP_LAST_STATUS_FIELD_ID,
  XOPURE_SYNC_MAP_LAST_SYNCED_AT_FIELD_ID,
  XOPURE_SYNC_MAP_OBJECT_ID,
  XOPURE_SYNC_MAP_SOURCE_RECORD_ID_FIELD_ID,
  XOPURE_SYNC_MAP_SOURCE_TABLE_FIELD_ID,
  XOPURE_SYNC_MAP_SYNC_KEY_FIELD_ID,
  XOPURE_SYNC_MAP_TARGET_OBJECT_FIELD_ID,
} from '../objects/xopure-sync-map.object';

export default defineView({
  universalIdentifier: '6472ffe4-7f61-479d-8a4b-d8e1ae94aa15',
  name: 'Sync Map Diagnostics',
  objectUniversalIdentifier: XOPURE_SYNC_MAP_OBJECT_ID,
  type: ViewType.TABLE,
  icon: 'IconArrowMerge',
  position: 0,
  fields: [
    {
      universalIdentifier: '34ae5d88-9b58-4d30-8cc3-73a0eeab9ad2',
      fieldMetadataUniversalIdentifier: XOPURE_SYNC_MAP_SYNC_KEY_FIELD_ID,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '4249f900-68fb-47a4-8451-96be48273f53',
      fieldMetadataUniversalIdentifier: XOPURE_SYNC_MAP_SOURCE_TABLE_FIELD_ID,
      position: 1,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: 'b769cafc-1c50-4261-8fc1-76d17eec631f',
      fieldMetadataUniversalIdentifier: XOPURE_SYNC_MAP_SOURCE_RECORD_ID_FIELD_ID,
      position: 2,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'ed06a44b-48a1-4dfe-8629-469df1cb4546',
      fieldMetadataUniversalIdentifier: XOPURE_SYNC_MAP_TARGET_OBJECT_FIELD_ID,
      position: 3,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '5f60f559-b6ca-4255-a2d4-9fdc0bdd5658',
      fieldMetadataUniversalIdentifier: XOPURE_SYNC_MAP_LAST_STATUS_FIELD_ID,
      position: 4,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '12f7f56c-7328-44a8-b0e7-8bf3a1ae70c5',
      fieldMetadataUniversalIdentifier: XOPURE_SYNC_MAP_LAST_SYNCED_AT_FIELD_ID,
      position: 5,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'fa5cde4d-a36e-4c0c-a1ec-2086c53bf459',
      fieldMetadataUniversalIdentifier:
        XOPURE_SYNC_MAP_LAST_ERROR_SUMMARY_FIELD_ID,
      position: 6,
      isVisible: true,
      size: 260,
    },
  ],
});
