import {
  defineViewField,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { BUYER_ON_OPPORTUNITY_ID } from '../fields/buyer-on-opportunity.field';

const RECORD_PAGE =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.views
    .opportunityRecordPageFields;

export default defineViewField({
  universalIdentifier: 'ebe94485-ea4e-424a-8fbc-3fec5a23f1e5',
  viewUniversalIdentifier: RECORD_PAGE.universalIdentifier,
  fieldMetadataUniversalIdentifier: BUYER_ON_OPPORTUNITY_ID,
  viewFieldGroupUniversalIdentifier:
    RECORD_PAGE.viewFieldGroups.relations.universalIdentifier,
  position: 10,
  isVisible: true,
});
