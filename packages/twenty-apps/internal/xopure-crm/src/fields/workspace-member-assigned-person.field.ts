import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import { PERSON_ASSIGNED_AMBASSADOR_FIELD_ID } from './person-assigned-ambassador.field';

export const WORKSPACE_MEMBER_ASSIGNED_PERSON_FIELD_ID =
  '38bfc992-fdd2-5dc8-8610-b07e37ddb907';

export default defineField({
  universalIdentifier: WORKSPACE_MEMBER_ASSIGNED_PERSON_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.RELATION,
  name: 'assignedPersons',
  label: 'Assigned Persons',
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: PERSON_ASSIGNED_AMBASSADOR_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
