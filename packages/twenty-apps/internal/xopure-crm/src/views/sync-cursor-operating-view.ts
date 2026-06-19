import { defineView, ViewType } from 'twenty-sdk/define';

import {
  XOPURE_SYNC_CURSOR_LAST_ERROR_SUMMARY_FIELD_ID,
  XOPURE_SYNC_CURSOR_LAST_RUN_AT_FIELD_ID,
  XOPURE_SYNC_CURSOR_LAST_RUN_STATUS_FIELD_ID,
  XOPURE_SYNC_CURSOR_OBJECT_ID,
  XOPURE_SYNC_CURSOR_STEP_FIELD_ID,
  XOPURE_SYNC_CURSOR_VALUE_FIELD_ID,
} from '../objects/xopure-sync-cursor.object';

export default defineView({
  universalIdentifier: '816a1b24-e4f2-4ab7-93c4-4f9798febb47',
  name: 'Sync Cursor Status',
  objectUniversalIdentifier: XOPURE_SYNC_CURSOR_OBJECT_ID,
  type: ViewType.TABLE,
  icon: 'IconPlayerTrackNext',
  position: 0,
  fields: [
    {
      universalIdentifier: '226495bb-abad-4a55-88ec-9489b07e61d4',
      fieldMetadataUniversalIdentifier: XOPURE_SYNC_CURSOR_STEP_FIELD_ID,
      position: 0,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '18b74817-0bc8-4cba-85dc-139a582425ac',
      fieldMetadataUniversalIdentifier: XOPURE_SYNC_CURSOR_VALUE_FIELD_ID,
      position: 1,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '85d6f8f7-44a4-447c-a1fc-0fa0518dfe9e',
      fieldMetadataUniversalIdentifier:
        XOPURE_SYNC_CURSOR_LAST_RUN_STATUS_FIELD_ID,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'bd872377-be42-44dc-9a0e-b5ae207bd762',
      fieldMetadataUniversalIdentifier: XOPURE_SYNC_CURSOR_LAST_RUN_AT_FIELD_ID,
      position: 3,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '300b48fd-485d-442c-8e76-9072a477bcb6',
      fieldMetadataUniversalIdentifier:
        XOPURE_SYNC_CURSOR_LAST_ERROR_SUMMARY_FIELD_ID,
      position: 4,
      isVisible: true,
      size: 260,
    },
  ],
});
