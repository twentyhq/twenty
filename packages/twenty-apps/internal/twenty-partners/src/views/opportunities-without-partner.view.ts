import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  ViewFilterOperand,
  ViewSortDirection,
  ViewType,
  defineView,
} from 'twenty-sdk/define';

import {
  MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  OPPORTUNITIES_NO_PARTNER_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Opportunities with no partner assigned yet. Deliberately simple — the matching
// system will be reworked later, so the pipeline is just split by partner presence.
export default defineView({
  universalIdentifier: OPPORTUNITIES_NO_PARTNER_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'OPP without partner',
  icon: 'IconUserOff',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: ViewType.TABLE,
  position: 0,
  fields: [
    // Name
    { universalIdentifier: '8af65247-8003-4d24-be3d-4b73356045d8', fieldMetadataUniversalIdentifier: '20202020-8609-4f65-a2d9-44009eb422b5', position: 0, isVisible: true, size: 200 },
    // Partner (empty here, kept for a consistent column set across the pipeline)
    { universalIdentifier: '3e89e8f2-6ee2-4258-a07d-3607f6238fd1', fieldMetadataUniversalIdentifier: 'd9eeacaa-2f9e-44cc-b5f6-5e1526256d49', position: 1, isVisible: true, size: 200 },
    // Amount
    { universalIdentifier: 'de63b508-8fc8-4696-8155-3511745db9b6', fieldMetadataUniversalIdentifier: '20202020-583e-4642-8533-db761d5fa82f', position: 2, isVisible: true, size: 140 },
    // Match status
    { universalIdentifier: 'c63c13d2-a332-4982-b50d-707cfa6b54b0', fieldMetadataUniversalIdentifier: MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 200 },
  ],
  // SELECT fields sort by option position, so this orders rows along the match-status
  // pipeline (To Be Matched → … → Won → Lost), not alphabetically.
  sorts: [
    {
      universalIdentifier: '6e6df89a-b614-43dc-8cb4-5746960986b9',
      fieldMetadataUniversalIdentifier: MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      direction: ViewSortDirection.ASC,
    },
  ],
  filters: [
    {
      universalIdentifier: 'd8dfd2de-c411-487a-ab9e-7abf81d4e4ef',
      fieldMetadataUniversalIdentifier: 'd9eeacaa-2f9e-44cc-b5f6-5e1526256d49',
      operand: ViewFilterOperand.IS_EMPTY,
      value: '',
    },
  ],
});
