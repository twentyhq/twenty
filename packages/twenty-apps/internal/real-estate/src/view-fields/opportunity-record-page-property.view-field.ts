import {
  defineViewField,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { PROPERTY_ON_OPPORTUNITY_ID } from '../fields/property-on-opportunity.field';

const RECORD_PAGE =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.views
    .opportunityRecordPageFields;

export default defineViewField({
  universalIdentifier: '3f690fd5-6d51-4103-89e1-cddf240780f3',
  viewUniversalIdentifier: RECORD_PAGE.universalIdentifier,
  fieldMetadataUniversalIdentifier: PROPERTY_ON_OPPORTUNITY_ID,
  viewFieldGroupUniversalIdentifier:
    RECORD_PAGE.viewFieldGroups.relations.universalIdentifier,
  position: 12,
  isVisible: true,
});
