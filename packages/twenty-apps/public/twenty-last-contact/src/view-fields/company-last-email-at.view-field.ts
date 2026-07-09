import {
  defineViewField,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  COMPANY_LAST_EMAIL_AT_FIELD_UNIVERSAL_IDENTIFIER,
  COMPANY_LAST_EMAIL_AT_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineViewField({
  universalIdentifier: COMPANY_LAST_EMAIL_AT_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
  viewUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.views.allCompanies
      .universalIdentifier,
  fieldMetadataUniversalIdentifier:
    COMPANY_LAST_EMAIL_AT_FIELD_UNIVERSAL_IDENTIFIER,
  position: 9,
  isVisible: false,
  size: 150,
});
