import {
  defineViewField,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { OPPORTUNITY_RECORD_PAGE_PARTNER_VIEW_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { PARTNER_ON_OPPORTUNITY_FIELD_ID } from 'src/fields/partner-on-opportunity.field';

const OPPORTUNITY_RECORD_PAGE_FIELDS =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.views.opportunityRecordPageFields;

export default defineViewField({
  universalIdentifier:
    OPPORTUNITY_RECORD_PAGE_PARTNER_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
  viewUniversalIdentifier: OPPORTUNITY_RECORD_PAGE_FIELDS.universalIdentifier,
  fieldMetadataUniversalIdentifier: PARTNER_ON_OPPORTUNITY_FIELD_ID,
  viewFieldGroupUniversalIdentifier:
    OPPORTUNITY_RECORD_PAGE_FIELDS.viewFieldGroups.relations.universalIdentifier,
  position: 3,
  isVisible: true,
});
