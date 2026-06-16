import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  ViewSortDirection,
  ViewType,
  defineView,
} from 'twenty-sdk/define';

import {
  ALL_OPPORTUNITIES_VIEW_UNIVERSAL_IDENTIFIER,
  MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// All opportunities, every stage. Kept last in the Pipeline folder; same column set
// as the without/with-partner views for consistent reading.
export default defineView({
  universalIdentifier: ALL_OPPORTUNITIES_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'OPP all',
  icon: 'IconTargetArrow',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: ViewType.TABLE,
  position: 3,
  fields: [
    // Name
    { universalIdentifier: '62844317-546c-4b65-a292-917bf0b5bfce', fieldMetadataUniversalIdentifier: '20202020-8609-4f65-a2d9-44009eb422b5', position: 0, isVisible: true, size: 200 },
    // Partner
    { universalIdentifier: '9f72d1ce-7c39-418c-95cb-480d1b176821', fieldMetadataUniversalIdentifier: 'd9eeacaa-2f9e-44cc-b5f6-5e1526256d49', position: 1, isVisible: true, size: 200 },
    // Amount (fresh view-field UID: the reused one still pointed at a removed column)
    { universalIdentifier: 'aa57f807-48aa-4a63-b939-434342ee4bdd', fieldMetadataUniversalIdentifier: '20202020-583e-4642-8533-db761d5fa82f', position: 2, isVisible: true, size: 140 },
    // Match status
    { universalIdentifier: '5db9ee26-8688-4a5c-9fe8-f76b41d8e80b', fieldMetadataUniversalIdentifier: MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 200 },
  ],
  // SELECT fields sort by option position, so this orders rows along the match-status
  // pipeline (To Be Matched → … → Won → Lost), not alphabetically.
  sorts: [
    {
      universalIdentifier: 'e7adc9b2-4294-408b-83a0-cece6833ba12',
      fieldMetadataUniversalIdentifier: MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      direction: ViewSortDirection.ASC,
    },
  ],
});
