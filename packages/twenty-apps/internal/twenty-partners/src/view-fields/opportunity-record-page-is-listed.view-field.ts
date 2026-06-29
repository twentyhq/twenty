import {
  defineViewField,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { OPPORTUNITY_RECORD_PAGE_IS_LISTED_VIEW_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { OPPORTUNITY_IS_LISTED_FIELD_ID } from 'src/fields/opportunity-is-listed.field';

const OPPORTUNITY_RECORD_PAGE_FIELDS =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.views.opportunityRecordPageFields;

export default defineViewField({
  universalIdentifier:
    OPPORTUNITY_RECORD_PAGE_IS_LISTED_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
  viewUniversalIdentifier: OPPORTUNITY_RECORD_PAGE_FIELDS.universalIdentifier,
  fieldMetadataUniversalIdentifier: OPPORTUNITY_IS_LISTED_FIELD_ID,
  viewFieldGroupUniversalIdentifier:
    OPPORTUNITY_RECORD_PAGE_FIELDS.viewFieldGroups.deal.universalIdentifier,
  position: 3,
  isVisible: true,
});
