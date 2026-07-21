import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { SHOWING_UNIVERSAL_IDENTIFIER } from '../objects/showing.object';
import {
  BUYER_ON_SHOWING_ID,
  SHOWINGS_ON_PERSON_ID,
} from './buyer-on-showing.field';

export default defineField({
  universalIdentifier: SHOWINGS_ON_PERSON_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'showings',
  label: 'Showings',
  icon: 'IconCalendarEvent',
  relationTargetObjectMetadataUniversalIdentifier: SHOWING_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: BUYER_ON_SHOWING_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
