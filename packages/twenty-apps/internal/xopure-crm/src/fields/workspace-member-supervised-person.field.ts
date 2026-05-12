import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import { PERSON_SUPERVISOR_FIELD_ID } from './person-supervisor.field';

export const WORKSPACE_MEMBER_SUPERVISED_PERSON_FIELD_ID =
  '862f0ed5-b411-53a6-8ebb-855f3e02fb75';

export default defineField({
  universalIdentifier: WORKSPACE_MEMBER_SUPERVISED_PERSON_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.RELATION,
  name: 'supervisedPersons',
  label: 'Supervised Persons',
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: PERSON_SUPERVISOR_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
