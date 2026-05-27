import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  ViewType,
  defineView,
} from 'twenty-sdk/define';

import {
  ALL_OPPORTUNITIES_VIEW_UNIVERSAL_IDENTIFIER,
  MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Default Opportunities view replacement. Surfaces matchStatus + partner alongside
// the standard Opportunity columns. partnerEligible column was dropped as part of
// the match-status redesign.
export default defineView({
  universalIdentifier: ALL_OPPORTUNITIES_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Opportunities',
  icon: 'IconTargetArrow',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: ViewType.TABLE,
  fields: [
    { universalIdentifier: '62844317-546c-4b65-a292-917bf0b5bfce', fieldMetadataUniversalIdentifier: '20202020-8609-4f65-a2d9-44009eb422b5', position: 0, isVisible: true },
    { universalIdentifier: '295a5b86-0b37-475a-8645-26f7e7a3dd0a', fieldMetadataUniversalIdentifier: '20202020-cbac-457e-b565-adece5fc815f', position: 1, isVisible: true },
    { universalIdentifier: 'ce684df4-4456-427c-b33b-38a34368e380', fieldMetadataUniversalIdentifier: '20202020-6f76-477d-8551-28cd65b2b4b9', position: 2, isVisible: true },
    { universalIdentifier: '9f72d1ce-7c39-418c-95cb-480d1b176821', fieldMetadataUniversalIdentifier: 'd9eeacaa-2f9e-44cc-b5f6-5e1526256d49', position: 3, isVisible: true },
    { universalIdentifier: '5db9ee26-8688-4a5c-9fe8-f76b41d8e80b', fieldMetadataUniversalIdentifier: MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 4, isVisible: true },
    { universalIdentifier: '3727d213-e3f5-43c7-ab05-b0fb2f211273', fieldMetadataUniversalIdentifier: '20202020-527e-44d6-b1ac-c4158d307b97', position: 5, isVisible: true },
    { universalIdentifier: 'c9ad9056-fd3a-448c-b4dc-e95e0c5d22e9', fieldMetadataUniversalIdentifier: '20202020-a63e-4a62-8e63-42a51828f831', position: 6, isVisible: true },
  ],
});
