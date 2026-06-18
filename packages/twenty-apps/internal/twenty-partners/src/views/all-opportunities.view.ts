import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  ViewType,
  defineView,
} from 'twenty-sdk/define';

import { ALL_OPPORTUNITIES_VIEW_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

// All opportunities, every stage. Kept last in the Matching folder.
export default defineView({
  universalIdentifier: ALL_OPPORTUNITIES_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'All Opportunities',
  icon: 'IconTargetArrow',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: ViewType.TABLE,
  position: 5,
  fields: [
    {
      universalIdentifier: '62844317-546c-4b65-a292-917bf0b5bfce',
      fieldMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.name
          .universalIdentifier,
      position: 0,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '9f72d1ce-7c39-418c-95cb-480d1b176821',
      fieldMetadataUniversalIdentifier: 'd9eeacaa-2f9e-44cc-b5f6-5e1526256d49',
      position: 1,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: 'aa57f807-48aa-4a63-b939-434342ee4bdd',
      fieldMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.amount
          .universalIdentifier,
      position: 2,
      isVisible: true,
      size: 140,
    },
  ],
});
