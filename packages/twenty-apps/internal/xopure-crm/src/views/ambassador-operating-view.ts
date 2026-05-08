import { defineView } from 'twenty-sdk/define';
import { ViewType } from 'twenty-sdk/define';
import { XOPURE_AMBASSADOR_LEVEL_FIELD_ID, XOPURE_AMBASSADOR_NAME_FIELD_ID, XOPURE_AMBASSADOR_OBJECT_ID, XOPURE_AMBASSADOR_STATUS_FIELD_ID } from '../objects/xopure-ambassador.object';

export default defineView({
  universalIdentifier: 'a43e3c94-4d39-444e-a752-c8f95a88b7bb',
  name: 'Ambassador Levels',
  objectUniversalIdentifier: XOPURE_AMBASSADOR_OBJECT_ID,
  type: ViewType.TABLE,
  icon: 'IconAward',
  position: 0,
  fields: [
    { universalIdentifier: '95d95e43-2d15-4a1c-87bb-5363914835be', fieldMetadataUniversalIdentifier: XOPURE_AMBASSADOR_NAME_FIELD_ID, position: 0, isVisible: true, size: 220 },
    { universalIdentifier: '088dd3a4-92e7-4f9e-a875-cb36e2ec0e23', fieldMetadataUniversalIdentifier: XOPURE_AMBASSADOR_LEVEL_FIELD_ID, position: 1, isVisible: true, size: 160 },
    { universalIdentifier: '4ad65ce5-6518-4f4d-b629-eae1cf2a55ef', fieldMetadataUniversalIdentifier: XOPURE_AMBASSADOR_STATUS_FIELD_ID, position: 2, isVisible: true, size: 160 },
  ],
});
