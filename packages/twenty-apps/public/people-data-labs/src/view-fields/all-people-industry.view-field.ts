import {
  defineViewField,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { PDL_FIELD_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineViewField({
  universalIdentifier: '97517614-573a-4abb-8676-18a3ef62225e',
  viewUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.views.allPeople
      .universalIdentifier,
  fieldMetadataUniversalIdentifier:
    PDL_FIELD_UNIVERSAL_IDENTIFIERS.person.pdlIndustry,
  position: 2,
  isVisible: true,
});
