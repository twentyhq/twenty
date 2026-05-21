import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  ViewFilterOperand,
  ViewType,
  defineView,
} from 'twenty-sdk/define';

import {
  ALL_MATCHED_DEALS_VIEW_UNIVERSAL_IDENTIFIER,
  MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Opportunities where a partner is engaged (MATCHED or later). Distinct from
// Matches overview, which also includes AUTO_MATCH (in-flight, no partner yet).
export default defineView({
  universalIdentifier: ALL_MATCHED_DEALS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'All matched deals',
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: ViewType.TABLE,
  fields: [
    { universalIdentifier: '76f6aea5-0e0b-4787-84f0-430d0799e913', fieldMetadataUniversalIdentifier: '20202020-8609-4f65-a2d9-44009eb422b5', position: 0, isVisible: true },
    { universalIdentifier: 'd9862d49-eff8-4103-9f48-a193cf8e1de2', fieldMetadataUniversalIdentifier: MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true },
    { universalIdentifier: '91c42a01-4ec8-4527-b9ac-9bdeb58e7243', fieldMetadataUniversalIdentifier: 'd9eeacaa-2f9e-44cc-b5f6-5e1526256d49', position: 2, isVisible: true },
    { universalIdentifier: 'c9689260-86f5-4e19-a86c-7afc95d4d6fe', fieldMetadataUniversalIdentifier: 'cc6b8a59-f860-493f-8b9a-f138c078fbf1', position: 3, isVisible: true },
    { universalIdentifier: 'd51c2737-26f8-4f27-b078-7bb0cf58c662', fieldMetadataUniversalIdentifier: 'fcf39b0c-0547-415e-806d-b238131ad7cc', position: 4, isVisible: true },
  ],
  filters: [
    {
      universalIdentifier: '71de9b3a-e59b-4baf-99e6-84fe01e037ee',
      fieldMetadataUniversalIdentifier: MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      // See filter-syntax note in Task 8.1.
      operand: ViewFilterOperand.IS,
      value: ['MATCHED', 'INTRODUCED_TO_A_PARTNER', 'WORKING_WITH_A_PARTNER', 'IMPLEMENTING', 'WON', 'RECONNECT_LATER', 'LOST'],
    },
  ],
});
