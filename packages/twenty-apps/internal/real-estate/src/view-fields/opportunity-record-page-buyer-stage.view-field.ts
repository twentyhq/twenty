import {
  defineViewField,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { BUYER_STAGE_FIELD_ID } from '../fields/opportunity-buyer-stage.field';

const RECORD_PAGE =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.views
    .opportunityRecordPageFields;

export default defineViewField({
  universalIdentifier: 'da074d0c-1596-42a5-8f82-e6ead2bd930d',
  viewUniversalIdentifier: RECORD_PAGE.universalIdentifier,
  fieldMetadataUniversalIdentifier: BUYER_STAGE_FIELD_ID,
  viewFieldGroupUniversalIdentifier:
    RECORD_PAGE.viewFieldGroups.deal.universalIdentifier,
  position: 10,
  isVisible: true,
});
