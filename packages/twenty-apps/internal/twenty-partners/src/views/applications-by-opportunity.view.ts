import { ViewSortDirection, ViewType, defineView } from 'twenty-sdk/define';

import {
  APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  APPLICATION_OPPORTUNITY_FIELD_ID,
  APPLICATION_PARTNER_FIELD_ID,
  APPLICATION_STATE_FIELD_ID,
} from 'src/objects/application.object';

const APPLICATION_PITCH_FIELD_ID = '0a6cd9c9-e1e9-4315-8356-b72077443805';
const APPLICATION_LAST_ACTIVITY_AT_FIELD_ID =
  'b184ac02-51b2-4442-9505-2b06f5c94112';

export const APPLICATIONS_BY_OPPORTUNITY_VIEW_UNIVERSAL_IDENTIFIER =
  'db489249-284d-41b1-8537-71a655389cb7';

// Relation fields cannot drive TABLE group-by in Twenty (only SELECT + static
// groups[]). Sort by opportunity so applicants cluster per brief instead.
export default defineView({
  universalIdentifier: APPLICATIONS_BY_OPPORTUNITY_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Applications by Opportunity',
  icon: 'IconTargetArrow',
  objectUniversalIdentifier: APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  position: 4,
  fields: [
    {
      universalIdentifier: '1b6984aa-4011-4b77-8121-9f4d987a2e07',
      fieldMetadataUniversalIdentifier: APPLICATION_OPPORTUNITY_FIELD_ID,
      position: 0,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: 'f57b1dd2-f415-4c01-8f0a-d55b941b23c7',
      fieldMetadataUniversalIdentifier: APPLICATION_PARTNER_FIELD_ID,
      position: 1,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '612db8df-a809-4557-add4-1802a434efb2',
      fieldMetadataUniversalIdentifier: APPLICATION_STATE_FIELD_ID,
      position: 2,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: 'ba53baa3-4db7-466e-a066-0d9156bc0a82',
      fieldMetadataUniversalIdentifier: APPLICATION_PITCH_FIELD_ID,
      position: 3,
      isVisible: true,
      size: 280,
    },
    {
      universalIdentifier: '2f570d42-614d-4562-8d12-df5605874b9c',
      fieldMetadataUniversalIdentifier: APPLICATION_LAST_ACTIVITY_AT_FIELD_ID,
      position: 4,
      isVisible: true,
      size: 180,
    },
  ],
  sorts: [
    {
      universalIdentifier: 'ce31ed78-cd7a-410a-8d95-2e10c846d765',
      fieldMetadataUniversalIdentifier: APPLICATION_OPPORTUNITY_FIELD_ID,
      direction: ViewSortDirection.ASC,
    },
  ],
});
