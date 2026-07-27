import {
  defineViewField,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  LAST_CONTACT_BY_FIELD_UNIVERSAL_IDENTIFIER,
  LAST_CONTACT_BY_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineViewField({
  universalIdentifier: LAST_CONTACT_BY_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
  viewUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.views.allPeople
      .universalIdentifier,
  fieldMetadataUniversalIdentifier: LAST_CONTACT_BY_FIELD_UNIVERSAL_IDENTIFIER,
  position: 7,
  isVisible: true,
  size: 150,
});
