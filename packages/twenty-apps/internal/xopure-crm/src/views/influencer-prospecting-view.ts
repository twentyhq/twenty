import { defineView } from 'twenty-sdk/define';
import { ViewType } from 'twenty-sdk/define';
import { INFLUENCER_PROSPECT_NAME_FIELD_ID, INFLUENCER_PROSPECT_OBJECT_ID, INFLUENCER_PROSPECT_STAGE_FIELD_ID } from '../objects/influencer-prospect.object';

export default defineView({
  universalIdentifier: '751957d7-01e7-43b0-9d14-df1d98011298',
  name: 'Influencer Prospecting',
  objectUniversalIdentifier: INFLUENCER_PROSPECT_OBJECT_ID,
  type: ViewType.TABLE,
  icon: 'IconBrandInstagram',
  position: 0,
  fields: [
    { universalIdentifier: '8c2a3810-0c2e-46df-a173-b2238c571051', fieldMetadataUniversalIdentifier: INFLUENCER_PROSPECT_NAME_FIELD_ID, position: 0, isVisible: true, size: 240 },
    { universalIdentifier: '327a3751-c88a-4eb6-9a39-874269944a26', fieldMetadataUniversalIdentifier: INFLUENCER_PROSPECT_STAGE_FIELD_ID, position: 1, isVisible: true, size: 160 },
  ],
});
