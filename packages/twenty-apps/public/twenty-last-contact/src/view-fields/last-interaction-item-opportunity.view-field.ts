import { defineViewField, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import {
  LAST_INTERACTION_FOR_OPPORTUNITIES_FIELD_UNIVERSAL_IDENTIFIER,
  LAST_INTERACTION_ITEM_FOR_OPPORTUNITIES_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineViewField({
  universalIdentifier:
    LAST_INTERACTION_ITEM_FOR_OPPORTUNITIES_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
  viewUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.views.allOpportunities
      .universalIdentifier,
  fieldMetadataUniversalIdentifier:
    LAST_INTERACTION_FOR_OPPORTUNITIES_FIELD_UNIVERSAL_IDENTIFIER,
  position: 8,
  isVisible: true,
  size: 150,
});
