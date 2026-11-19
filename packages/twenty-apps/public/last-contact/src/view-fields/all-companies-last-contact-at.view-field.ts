import {
  defineViewField,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { COMPANY_LAST_CONTACT_AT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineViewField({
  universalIdentifier: '8edb6b6c-dcff-4e1c-bfc2-c88cb749cf35',
  viewUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.views.allCompanies
      .universalIdentifier,
  fieldMetadataUniversalIdentifier:
    COMPANY_LAST_CONTACT_AT_FIELD_UNIVERSAL_IDENTIFIER,
  position: 0,
  isVisible: true,
});
