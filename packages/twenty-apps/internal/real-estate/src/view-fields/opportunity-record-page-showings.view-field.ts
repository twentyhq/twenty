import {
  defineViewField,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { SHOWINGS_ON_OPPORTUNITY_ID } from '../fields/opportunity-on-showing.field';

const RECORD_PAGE =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.views
    .opportunityRecordPageFields;

export default defineViewField({
  universalIdentifier: '1db76619-5814-4eee-933a-88f88dc1f70b',
  viewUniversalIdentifier: RECORD_PAGE.universalIdentifier,
  fieldMetadataUniversalIdentifier: SHOWINGS_ON_OPPORTUNITY_ID,
  viewFieldGroupUniversalIdentifier:
    RECORD_PAGE.viewFieldGroups.relations.universalIdentifier,
  position: 13,
  isVisible: true,
});
