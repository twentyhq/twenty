import {
  defineViewField,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { LAST_CONTACT_AT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineViewField({
  universalIdentifier: '180d8381-0490-4126-b8e0-6ff91ae08901',
  viewUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.views.allPeople
      .universalIdentifier,
  fieldMetadataUniversalIdentifier: LAST_CONTACT_AT_FIELD_UNIVERSAL_IDENTIFIER,
  position: 0,
  isVisible: true,
});
