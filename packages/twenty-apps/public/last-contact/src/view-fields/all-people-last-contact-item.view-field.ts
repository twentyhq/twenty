import {
  defineViewField,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { LAST_CONTACT_ITEM_MORPH_ID } from 'src/constants/universal-identifiers';

export default defineViewField({
  universalIdentifier: 'ce9b8b7a-0793-4792-b15d-26c24c81e3b3',
  viewUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.views.allPeople
      .universalIdentifier,
  fieldMetadataUniversalIdentifier: LAST_CONTACT_ITEM_MORPH_ID,
  position: 2,
  isVisible: true,
});
