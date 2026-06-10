import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  ViewFilterOperand,
  ViewSortDirection,
  ViewType,
  defineView,
} from 'twenty-sdk/define';

import {
  MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  OPPORTUNITIES_WITH_PARTNER_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Opportunities that already have a partner assigned. Same simple column set as the
// other pipeline views.
export default defineView({
  universalIdentifier: OPPORTUNITIES_WITH_PARTNER_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'OPP with partner',
  icon: 'IconUserCheck',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: ViewType.TABLE,
  position: 1,
  fields: [
    // Name
    { universalIdentifier: 'f29e2d21-f050-4637-b1f2-9418c6768246', fieldMetadataUniversalIdentifier: '20202020-8609-4f65-a2d9-44009eb422b5', position: 0, isVisible: true, size: 200 },
    // Partner
    { universalIdentifier: 'a4beb55d-10f8-4314-9552-9526494447d7', fieldMetadataUniversalIdentifier: 'd9eeacaa-2f9e-44cc-b5f6-5e1526256d49', position: 1, isVisible: true, size: 200 },
    // Amount
    { universalIdentifier: '87e8d97a-0782-48b5-b397-2f9165ecebf0', fieldMetadataUniversalIdentifier: '20202020-583e-4642-8533-db761d5fa82f', position: 2, isVisible: true, size: 140 },
    // Match status
    { universalIdentifier: 'f2a237c1-1300-4648-a4ef-012ffa2996d7', fieldMetadataUniversalIdentifier: MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 200 },
  ],
  // SELECT fields sort by option position, so this orders rows along the match-status
  // pipeline (To Be Matched → … → Won → Lost), not alphabetically.
  sorts: [
    {
      universalIdentifier: '418705f0-435f-4800-83b0-481edfea0933',
      fieldMetadataUniversalIdentifier: MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      direction: ViewSortDirection.ASC,
    },
  ],
  filters: [
    {
      universalIdentifier: '3cc1817a-84bb-4eb5-8755-bc72f81b202d',
      fieldMetadataUniversalIdentifier: 'd9eeacaa-2f9e-44cc-b5f6-5e1526256d49',
      operand: ViewFilterOperand.IS_NOT_EMPTY,
      value: '',
    },
  ],
});
