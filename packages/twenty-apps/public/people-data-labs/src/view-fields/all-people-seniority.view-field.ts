import {
  defineViewField,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { PDL_FIELD_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineViewField({
  universalIdentifier: '52935e92-4153-428a-9d11-5536e4afa9c7',
  viewUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.views.allPeople
      .universalIdentifier,
  fieldMetadataUniversalIdentifier:
    PDL_FIELD_UNIVERSAL_IDENTIFIERS.person.pdlSeniority,
  position: 0,
  isVisible: true,
});
