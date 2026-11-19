import {
  defineViewField,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { COMPANY_LAST_CONTACT_ITEM_MORPH_ID } from 'src/constants/universal-identifiers';

export default defineViewField({
  universalIdentifier: 'd0502f8b-781b-4653-9910-0286455fd4e6',
  viewUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.views.allCompanies
      .universalIdentifier,
  fieldMetadataUniversalIdentifier: COMPANY_LAST_CONTACT_ITEM_MORPH_ID,
  position: 1,
  isVisible: true,
});
