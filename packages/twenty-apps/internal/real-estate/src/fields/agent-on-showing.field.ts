import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { SHOWING_UNIVERSAL_IDENTIFIER } from '../objects/showing.object';

export const AGENT_ON_SHOWING_ID = 'e25d8e44-2210-4765-8723-46a3228295ab';
export const AGENT_SHOWINGS_ON_PERSON_ID =
  'aed60deb-9d96-41fd-821a-446175b3016d';

export default defineField({
  universalIdentifier: AGENT_ON_SHOWING_ID,
  objectUniversalIdentifier: SHOWING_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'agent',
  label: 'Agent',
  icon: 'IconUserStar',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: AGENT_SHOWINGS_ON_PERSON_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'agentId',
  },
});
