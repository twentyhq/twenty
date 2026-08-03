import {
  defineViewField,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { REFERRED_BY_PARTNER_ON_OPPORTUNITY_FIELD_ID } from 'src/modules/opportunity/fields/referred-by-partner-on-opportunity.field';

export const OPPORTUNITY_RECORD_PAGE_REFERRED_BY_PARTNER_VIEW_FIELD_UNIVERSAL_IDENTIFIER =
  '894a2b31-9c71-4365-aab1-27b805ac1bf8';

const OPPORTUNITY_RECORD_PAGE_FIELDS =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.views.opportunityRecordPageFields;

export default defineViewField({
  universalIdentifier:
    OPPORTUNITY_RECORD_PAGE_REFERRED_BY_PARTNER_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
  viewUniversalIdentifier: OPPORTUNITY_RECORD_PAGE_FIELDS.universalIdentifier,
  fieldMetadataUniversalIdentifier: REFERRED_BY_PARTNER_ON_OPPORTUNITY_FIELD_ID,
  viewFieldGroupUniversalIdentifier:
    OPPORTUNITY_RECORD_PAGE_FIELDS.viewFieldGroups.relations.universalIdentifier,
  position: 5,
  isVisible: true,
});
