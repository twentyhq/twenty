import { ViewType, defineView } from 'twenty-sdk/define';

import {
  APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  APPLICATION_OPPORTUNITY_FIELD_ID,
  APPLICATION_PARTNER_FIELD_ID,
  APPLICATION_STATE_FIELD_ID,
} from 'src/objects/application.object';

// pitch/lastActivityAt ids are inline literals in application.object.ts (not exported).
const APPLICATION_PITCH_FIELD_ID = '0a6cd9c9-e1e9-4315-8356-b72077443805';
const APPLICATION_LAST_ACTIVITY_AT_FIELD_ID =
  'b184ac02-51b2-4442-9505-2b06f5c94112';

export const APPLICATION_RECORD_PAGE_FIELDS_VIEW_ID =
  'e004c2ff-462a-45d4-8a77-071dcf093879';

// FIELDS_WIDGET view backing the Application record page side panel. Relation fields
// (opportunity, partner) only render in the fields widget when an explicit view marks them
// visible — this is that view.
export default defineView({
  universalIdentifier: APPLICATION_RECORD_PAGE_FIELDS_VIEW_ID,
  name: 'Application Record Page Fields',
  objectUniversalIdentifier: APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.FIELDS_WIDGET,
  fields: [
    { universalIdentifier: '44793f47-5d06-43fa-9d33-23ec7602ecfc', fieldMetadataUniversalIdentifier: APPLICATION_OPPORTUNITY_FIELD_ID, position: 0, isVisible: true },
    { universalIdentifier: '7d7ef49a-6d30-44de-b4eb-bb77d93b8982', fieldMetadataUniversalIdentifier: APPLICATION_PARTNER_FIELD_ID, position: 1, isVisible: true },
    { universalIdentifier: 'd0278990-928c-4660-ac27-3abca0e52a5e', fieldMetadataUniversalIdentifier: APPLICATION_STATE_FIELD_ID, position: 2, isVisible: true },
    { universalIdentifier: '28e0642b-76eb-4d41-83de-b84f07b3aad9', fieldMetadataUniversalIdentifier: APPLICATION_PITCH_FIELD_ID, position: 3, isVisible: true },
    { universalIdentifier: '97acca2b-bda4-43f3-b58a-3293807fab08', fieldMetadataUniversalIdentifier: APPLICATION_LAST_ACTIVITY_AT_FIELD_ID, position: 4, isVisible: true },
  ],
});
