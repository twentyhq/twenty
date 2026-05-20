import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  ViewFilterOperand,
  ViewType,
  defineView,
} from 'twenty-sdk/define';

import {
  MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  MATCHES_OVERVIEW_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Funnel of in-pipeline opportunities. Grouped by matchStatus to feed a Kanban
// (group-by works; ViewType.KANBAN itself is still TABLE due to BACKLOG.md
// SDK limitation — flip to Kanban manually in the UI).
// Excludes TO_BE_MATCHED and MANUAL_MATCH (those live in the Waiting for match inbox).
export default defineView({
  universalIdentifier: MATCHES_OVERVIEW_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Matches overview',
  icon: 'IconLayoutKanban',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: ViewType.TABLE,
  // mainGroupByFieldMetadataUniversalIdentifier: MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    { universalIdentifier: '7a6403c1-7ab9-4c3a-b833-3c028d43140e', fieldMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.name.universalIdentifier, position: 0, isVisible: true },
    { universalIdentifier: '2e718b4b-fde8-4839-9cdf-deb09db0e6b6', fieldMetadataUniversalIdentifier: 'd9eeacaa-2f9e-44cc-b5f6-5e1526256d49', position: 1, isVisible: true },
    { universalIdentifier: '5ae8805c-3d71-4ccc-a2be-38368f32e3e1', fieldMetadataUniversalIdentifier: MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true },
    { universalIdentifier: 'cb4e5d2b-7003-4f30-874c-acda310b250c', fieldMetadataUniversalIdentifier: 'fcf39b0c-0547-415e-806d-b238131ad7cc', position: 3, isVisible: true },
    { universalIdentifier: '0fc87e70-7aa1-4c85-9152-d0edff8ae8a4', fieldMetadataUniversalIdentifier: 'cc6b8a59-f860-493f-8b9a-f138c078fbf1', position: 4, isVisible: true },
  ],
  filters: [
    {
      universalIdentifier: 'c2556a69-5ee7-4e1c-a5e5-ed277ae7e3e0',
      fieldMetadataUniversalIdentifier: MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      // Include AUTO_MATCH + all post-match statuses. See filter-syntax note in Task 8.1.
      operand: ViewFilterOperand.IS,
      value: ["IMPLEMENTING", "INTRO_SENT"],
    },
  ],
});
