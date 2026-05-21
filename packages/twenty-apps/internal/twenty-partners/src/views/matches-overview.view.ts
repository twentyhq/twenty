import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  ViewType,
  defineView,
} from 'twenty-sdk/define';

import {
  MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  MATCHES_OVERVIEW_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Full matching funnel: a Kanban grouped by matchStatus, no filter (every
// opportunity appears in its matchStatus column).
export default defineView({
  universalIdentifier: MATCHES_OVERVIEW_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Matches overview',
  icon: 'IconLayoutKanban',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: ViewType.KANBAN,
  mainGroupByFieldMetadataUniversalIdentifier: MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    { universalIdentifier: '7a6403c1-7ab9-4c3a-b833-3c028d43140e', fieldMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.name.universalIdentifier, position: 0, isVisible: true },
    { universalIdentifier: '2e718b4b-fde8-4839-9cdf-deb09db0e6b6', fieldMetadataUniversalIdentifier: 'd9eeacaa-2f9e-44cc-b5f6-5e1526256d49', position: 1, isVisible: true },
    { universalIdentifier: '5ae8805c-3d71-4ccc-a2be-38368f32e3e1', fieldMetadataUniversalIdentifier: MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true },
    { universalIdentifier: 'cb4e5d2b-7003-4f30-874c-acda310b250c', fieldMetadataUniversalIdentifier: 'fcf39b0c-0547-415e-806d-b238131ad7cc', position: 3, isVisible: true },
    { universalIdentifier: '0fc87e70-7aa1-4c85-9152-d0edff8ae8a4', fieldMetadataUniversalIdentifier: 'cc6b8a59-f860-493f-8b9a-f138c078fbf1', position: 4, isVisible: true },
  ],
});
