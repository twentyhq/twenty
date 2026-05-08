import { defineView } from 'twenty-sdk/define';
import { ViewType } from 'twenty-sdk/define';
import { RETAIL_PROSPECT_NAME_FIELD_ID, RETAIL_PROSPECT_OBJECT_ID, RETAIL_PROSPECT_STAGE_FIELD_ID } from '../objects/retail-prospect.object';

export default defineView({
  universalIdentifier: 'df2dd314-26c9-43b0-9f61-a915d522b6de',
  name: 'Retail Prospecting',
  objectUniversalIdentifier: RETAIL_PROSPECT_OBJECT_ID,
  type: ViewType.TABLE,
  icon: 'IconBuildingStore',
  position: 0,
  fields: [
    { universalIdentifier: '4a719e2e-9914-4397-a697-64efb00f8fe7', fieldMetadataUniversalIdentifier: RETAIL_PROSPECT_NAME_FIELD_ID, position: 0, isVisible: true, size: 240 },
    { universalIdentifier: '6c427528-bffc-47eb-86de-71087b50e8ee', fieldMetadataUniversalIdentifier: RETAIL_PROSPECT_STAGE_FIELD_ID, position: 1, isVisible: true, size: 160 },
  ],
});
