import { ViewFilterOperand, ViewType, defineView } from 'twenty-sdk/define';

import {
  APPLICATION_LAST_ACTIVITY_AT_FIELD_ID,
  APPLICATION_NAME_FIELD_ID,
  APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  APPLICATION_OPPORTUNITY_FIELD_ID,
  APPLICATION_PARTNER_FIELD_ID,
  APPLICATION_PITCH_FIELD_ID,
  APPLICATION_STATE_FIELD_ID,
} from 'src/objects/application.object';

export const FOLLOWUP_APPLICATIONS_VIEW_UNIVERSAL_IDENTIFIER =
  'c815e9f5-511b-467f-85b0-08ef341ff856';

export default defineView({
  universalIdentifier: FOLLOWUP_APPLICATIONS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Follow-up · Applications',
  icon: 'IconClock',
  objectUniversalIdentifier: APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  position: 3,
  fields: [
    {
      universalIdentifier: '5f3632ec-797f-4b96-a228-c56830dc75d4',
      fieldMetadataUniversalIdentifier: APPLICATION_NAME_FIELD_ID,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '8844728f-9622-4554-9916-dba8328d3c9c',
      fieldMetadataUniversalIdentifier: APPLICATION_OPPORTUNITY_FIELD_ID,
      position: 1,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '678c7516-1436-40fd-b3b4-6e5fefcecf0e',
      fieldMetadataUniversalIdentifier: APPLICATION_PARTNER_FIELD_ID,
      position: 2,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '5f7884af-c5a4-4822-b8bf-0fb233e28f2f',
      fieldMetadataUniversalIdentifier: APPLICATION_STATE_FIELD_ID,
      position: 3,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: 'c1ea77ed-a4ab-4937-929e-d1b719a7a8d8',
      fieldMetadataUniversalIdentifier: APPLICATION_PITCH_FIELD_ID,
      position: 4,
      isVisible: true,
      size: 280,
    },
    {
      universalIdentifier: '4c5c5fb0-7a32-418e-a190-54d37547ddd3',
      fieldMetadataUniversalIdentifier: APPLICATION_LAST_ACTIVITY_AT_FIELD_ID,
      position: 5,
      isVisible: true,
      size: 180,
    },
  ],
  filters: [
    // TODO(B5): add lastActivityAt > 7d relative filter once operand form confirmed
    // ponytail: 7d literal in the filter, not config.
    {
      universalIdentifier: 'b89e349f-7b69-4917-8988-edb22d0314ac',
      fieldMetadataUniversalIdentifier: APPLICATION_STATE_FIELD_ID,
      operand: ViewFilterOperand.IS,
      value: ['APPLIED', 'INVITED', 'INTRODUCED'],
    },
  ],
});
