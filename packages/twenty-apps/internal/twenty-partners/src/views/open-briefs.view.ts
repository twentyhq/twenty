import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  ViewFilterOperand,
  ViewType,
  defineView,
} from 'twenty-sdk/define';

import { OPPORTUNITY_IS_LISTED_FIELD_ID } from 'src/fields/opportunity-is-listed.field';
import { OPPORTUNITY_NEED_FIELD_ID } from 'src/fields/opportunity-need.field';
import { OPPORTUNITY_REQUIREMENTS_FIELD_ID } from 'src/fields/opportunity-requirements.field';

export const OPEN_BRIEFS_VIEW_UNIVERSAL_IDENTIFIER =
  'e1f9629d-c490-450e-b3c5-c944aca292eb';

// Marketplace view: all Opportunities that ops have listed for partner browsing.
// Partners see this list and apply via the "Apply" workflow action (B4).
export default defineView({
  universalIdentifier: OPEN_BRIEFS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Open Briefs',
  icon: 'IconBuildingStore',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: ViewType.TABLE,
  position: 5,
  fields: [
    // Name
    { universalIdentifier: '74595afa-c9c4-45b6-b362-803fb5574fbd', fieldMetadataUniversalIdentifier: '20202020-8609-4f65-a2d9-44009eb422b5', position: 0, isVisible: true, size: 200 },
    // Need (B1 brief field)
    { universalIdentifier: 'a24d52c4-9d0b-4145-a8fb-a4e21e002f58', fieldMetadataUniversalIdentifier: OPPORTUNITY_NEED_FIELD_ID, position: 1, isVisible: true, size: 280 },
    // Requirements (B1 brief field)
    { universalIdentifier: '8cd4738b-2975-45e0-959b-8e830a8bf3dc', fieldMetadataUniversalIdentifier: OPPORTUNITY_REQUIREMENTS_FIELD_ID, position: 2, isVisible: true, size: 280 },
    // Listed flag — visible so ops can verify the filter at a glance
    { universalIdentifier: '9720b93b-be90-40ee-89b2-42c04c8e09da', fieldMetadataUniversalIdentifier: OPPORTUNITY_IS_LISTED_FIELD_ID, position: 3, isVisible: true, size: 90 },
  ],
  filters: [
    // Show only opportunities marked as listed (isListed = true).
    // BOOLEAN fields use ViewFilterOperand.IS with the string value 'true' —
    // the same representation the Twenty frontend stores and reads for boolean IS filters.
    {
      universalIdentifier: '642be3a1-c0f8-4197-9628-a2d3e25ed624',
      fieldMetadataUniversalIdentifier: OPPORTUNITY_IS_LISTED_FIELD_ID,
      operand: ViewFilterOperand.IS,
      value: 'true',
    },
  ],
});
