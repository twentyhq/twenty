import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { SHOWING_UNIVERSAL_IDENTIFIER } from '../objects/showing.object';
import {
  AGENT_ON_SHOWING_ID,
  AGENT_SHOWINGS_ON_PERSON_ID,
} from './agent-on-showing.field';

export default defineField({
  universalIdentifier: AGENT_SHOWINGS_ON_PERSON_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'agentShowings',
  label: 'Showings as agent',
  icon: 'IconCalendarEvent',
  relationTargetObjectMetadataUniversalIdentifier: SHOWING_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: AGENT_ON_SHOWING_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
