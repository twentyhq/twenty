import {
  defineViewField,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { SELLER_ON_OPPORTUNITY_ID } from '../fields/seller-on-opportunity.field';

const RECORD_PAGE =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.views
    .opportunityRecordPageFields;

export default defineViewField({
  universalIdentifier: '7a308ab9-e1aa-435b-81a2-0299bcf6991b',
  viewUniversalIdentifier: RECORD_PAGE.universalIdentifier,
  fieldMetadataUniversalIdentifier: SELLER_ON_OPPORTUNITY_ID,
  viewFieldGroupUniversalIdentifier:
    RECORD_PAGE.viewFieldGroups.relations.universalIdentifier,
  position: 11,
  isVisible: true,
});
