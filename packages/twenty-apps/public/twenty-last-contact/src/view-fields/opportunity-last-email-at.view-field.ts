import {
  defineViewField,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  OPPORTUNITY_LAST_EMAIL_AT_FIELD_UNIVERSAL_IDENTIFIER,
  OPPORTUNITY_LAST_EMAIL_AT_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineViewField({
  universalIdentifier: OPPORTUNITY_LAST_EMAIL_AT_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
  viewUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.views.allOpportunities
      .universalIdentifier,
  fieldMetadataUniversalIdentifier:
    OPPORTUNITY_LAST_EMAIL_AT_FIELD_UNIVERSAL_IDENTIFIER,
  position: 8,
  isVisible: false,
  size: 150,
});
