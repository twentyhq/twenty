import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { PROPERTY_UNIVERSAL_IDENTIFIER } from '../objects/property.object';
import { SHOWING_UNIVERSAL_IDENTIFIER } from '../objects/showing.object';
import {
  PROPERTY_ON_SHOWING_ID,
  SHOWINGS_ON_PROPERTY_ID,
} from './property-on-showing.field';

export default defineField({
  universalIdentifier: SHOWINGS_ON_PROPERTY_ID,
  objectUniversalIdentifier: PROPERTY_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'showings',
  label: 'Showings',
  icon: 'IconCalendarEvent',
  relationTargetObjectMetadataUniversalIdentifier: SHOWING_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: PROPERTY_ON_SHOWING_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
