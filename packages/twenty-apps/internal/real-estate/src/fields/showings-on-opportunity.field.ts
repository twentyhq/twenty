import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { SHOWING_UNIVERSAL_IDENTIFIER } from '../objects/showing.object';
import {
  OPPORTUNITY_ON_SHOWING_ID,
  SHOWINGS_ON_OPPORTUNITY_ID,
} from './opportunity-on-showing.field';

export default defineField({
  universalIdentifier: SHOWINGS_ON_OPPORTUNITY_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.RELATION,
  name: 'showings',
  label: 'Showings',
  icon: 'IconCalendarEvent',
  relationTargetObjectMetadataUniversalIdentifier: SHOWING_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: OPPORTUNITY_ON_SHOWING_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
