import {
  defineViewField,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { PDL_FIELD_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineViewField({
  universalIdentifier: 'a3ff9e3a-f6f7-4edc-aa9a-a1b64b083afa',
  viewUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.views.allPeople
      .universalIdentifier,
  fieldMetadataUniversalIdentifier:
    PDL_FIELD_UNIVERSAL_IDENTIFIERS.person.pdlEnrichmentStatus,
  position: 3,
  isVisible: true,
});
