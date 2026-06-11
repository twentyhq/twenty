import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  ViewFilterOperand,
  ViewSortDirection,
  ViewType,
  defineView,
} from 'twenty-sdk/define';

import {
  MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  WAITING_FOR_MATCH_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Ops inbox: opportunities awaiting a human matching decision.
// Includes TO_BE_MATCHED (default for new opps).
export default defineView({
  universalIdentifier: WAITING_FOR_MATCH_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Waiting for match',
  icon: 'IconClockHour4',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: ViewType.KANBAN,
  mainGroupByFieldMetadataUniversalIdentifier: MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    { universalIdentifier: 'd74b5eb3-21ee-48fa-b703-4cfd629738b4', fieldMetadataUniversalIdentifier: '20202020-8609-4f65-a2d9-44009eb422b5', position: 0, isVisible: true },
    { universalIdentifier: '50822cf9-c238-4450-ba31-5807011afa65', fieldMetadataUniversalIdentifier: '20202020-cbac-457e-b565-adece5fc815f', position: 1, isVisible: true },
    { universalIdentifier: 'f432a71f-3bd0-495e-b5b1-8a78e155dc5a', fieldMetadataUniversalIdentifier: '20202020-d01b-4132-9b32-123456789abc', position: 2, isVisible: true },
    { universalIdentifier: '9e47592f-9965-4ee7-9c6a-303477b293f4', fieldMetadataUniversalIdentifier: 'cc6b8a59-f860-493f-8b9a-f138c078fbf1', position: 3, isVisible: true },
    // matchStatus column (replaces the dropped partnerEligible column)
    { universalIdentifier: '909e1eee-077a-4f23-8c9b-4c8027623a78', fieldMetadataUniversalIdentifier: MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 4, isVisible: true },
  ],
  filters: [
    {
      universalIdentifier: '93476207-1471-49d9-898c-f8a1d52f468f',
      fieldMetadataUniversalIdentifier: MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      operand: ViewFilterOperand.IS,
      value: ['TO_BE_MATCHED'],
    },
  ],
  sorts: [
    {
      universalIdentifier: 'a7c5a89e-d9d7-4cf6-a6d2-3ad9f12a7b1f',
      fieldMetadataUniversalIdentifier: '20202020-d01b-4132-9b32-123456789abc',
      direction: ViewSortDirection.ASC,
    },
  ],
});
