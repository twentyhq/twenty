import {
  defineViewField,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { OPPORTUNITY_LAST_CONTACT_AT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineViewField({
  universalIdentifier: 'cb42506c-ad47-4472-947f-696046d645ab',
  viewUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.views.byStage
      .universalIdentifier,
  fieldMetadataUniversalIdentifier:
    OPPORTUNITY_LAST_CONTACT_AT_FIELD_UNIVERSAL_IDENTIFIER,
  position: 0,
  isVisible: true,
});
