import { ViewType, defineView } from 'twenty-sdk/define';
import {
  TFT_SYNC_EVENT_DIRECTION_FIELD_UUID,
  TFT_SYNC_EVENT_ERROR_FIELD_UUID,
  TFT_SYNC_EVENT_OBJECT_UUID,
  TFT_SYNC_EVENT_OPP_NAME_FIELD_UUID,
  TFT_SYNC_EVENT_STATUS_FIELD_UUID,
  TFT_SYNC_EVENT_TFT_OPP_ID_FIELD_UUID,
  TFT_SYNC_EVENTS_VIEW_UUID,
} from 'src/constants/universal-identifiers';

export default defineView({
  universalIdentifier: TFT_SYNC_EVENTS_VIEW_UUID,
  name: 'TFT Sync Events',
  icon: 'IconRefresh',
  objectUniversalIdentifier: TFT_SYNC_EVENT_OBJECT_UUID,
  type: ViewType.TABLE,
  fields: [
    {
      universalIdentifier: '11112222-3333-4444-8555-666677778886',
      fieldMetadataUniversalIdentifier: TFT_SYNC_EVENT_OPP_NAME_FIELD_UUID,
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier: '11112222-3333-4444-8555-666677778881',
      fieldMetadataUniversalIdentifier: TFT_SYNC_EVENT_TFT_OPP_ID_FIELD_UUID,
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: '11112222-3333-4444-8555-666677778882',
      fieldMetadataUniversalIdentifier: TFT_SYNC_EVENT_DIRECTION_FIELD_UUID,
      position: 2,
      isVisible: true,
    },
    {
      universalIdentifier: '11112222-3333-4444-8555-666677778883',
      fieldMetadataUniversalIdentifier: TFT_SYNC_EVENT_STATUS_FIELD_UUID,
      position: 3,
      isVisible: true,
    },
    {
      universalIdentifier: '11112222-3333-4444-8555-666677778884',
      fieldMetadataUniversalIdentifier: TFT_SYNC_EVENT_ERROR_FIELD_UUID,
      position: 4,
      isVisible: true,
    },
    {
      universalIdentifier: '11112222-3333-4444-8555-666677778885',
      fieldMetadataUniversalIdentifier: '02514cfc-d56d-5c64-a2e0-612aa30074a6',
      position: 5,
      isVisible: true,
    },
  ],
});
