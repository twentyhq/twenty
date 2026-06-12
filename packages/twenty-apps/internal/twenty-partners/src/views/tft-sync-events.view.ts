import { ViewType, defineView } from 'twenty-sdk/define';
import {
  PARTNERS_TFT_SYNC_EVENT_DIRECTION_FIELD_UUID,
  PARTNERS_TFT_SYNC_EVENT_ERROR_FIELD_UUID,
  PARTNERS_TFT_SYNC_EVENT_OBJECT_UUID,
  PARTNERS_TFT_SYNC_EVENT_OPP_NAME_FIELD_UUID,
  PARTNERS_TFT_SYNC_EVENT_STATUS_FIELD_UUID,
  PARTNERS_TFT_SYNC_EVENT_TFT_OPP_ID_FIELD_UUID,
  PARTNERS_TFT_SYNC_EVENTS_VIEW_UUID,
} from 'src/constants/universal-identifiers';

export default defineView({
  universalIdentifier: PARTNERS_TFT_SYNC_EVENTS_VIEW_UUID,
  name: 'TFT Sync Events',
  icon: 'IconRefresh',
  objectUniversalIdentifier: PARTNERS_TFT_SYNC_EVENT_OBJECT_UUID,
  type: ViewType.TABLE,
  fields: [
    {
      universalIdentifier: '22223333-4444-4555-8666-777788889996',
      fieldMetadataUniversalIdentifier: PARTNERS_TFT_SYNC_EVENT_OPP_NAME_FIELD_UUID,
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier: '22223333-4444-4555-8666-777788889991',
      fieldMetadataUniversalIdentifier: PARTNERS_TFT_SYNC_EVENT_TFT_OPP_ID_FIELD_UUID,
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: '22223333-4444-4555-8666-777788889992',
      fieldMetadataUniversalIdentifier: PARTNERS_TFT_SYNC_EVENT_DIRECTION_FIELD_UUID,
      position: 2,
      isVisible: true,
    },
    {
      universalIdentifier: '22223333-4444-4555-8666-777788889993',
      fieldMetadataUniversalIdentifier: PARTNERS_TFT_SYNC_EVENT_STATUS_FIELD_UUID,
      position: 3,
      isVisible: true,
    },
    {
      universalIdentifier: '22223333-4444-4555-8666-777788889994',
      fieldMetadataUniversalIdentifier: PARTNERS_TFT_SYNC_EVENT_ERROR_FIELD_UUID,
      position: 4,
      isVisible: true,
    },
    {
      // Standard createdAt field — referenced by its generated universalIdentifier since
      // standard fields have no app-defined constant. "When" the sync happened.
      universalIdentifier: '22223333-4444-4555-8666-777788889995',
      fieldMetadataUniversalIdentifier: 'b1d67b49-3e8b-5d73-888d-eeef2c4e9e6d',
      position: 5,
      isVisible: true,
    },
  ],
});
