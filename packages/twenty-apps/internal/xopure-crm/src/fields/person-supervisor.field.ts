import { defineField, FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import { WORKSPACE_MEMBER_SUPERVISED_PERSON_FIELD_ID } from './workspace-member-supervised-person.field';

export const PERSON_SUPERVISOR_FIELD_ID =
  '56fd08e1-3e5a-50c8-b9e0-16e412c2f47a';

export default defineField({
  universalIdentifier: PERSON_SUPERVISOR_FIELD_ID,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'supervisor',
  label: 'Supervisor',
  description: 'The ambassador manager who can monitor this record. Denormalized from the assigned ambassador profile.',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: WORKSPACE_MEMBER_SUPERVISED_PERSON_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'supervisorId',
  },
  icon: 'IconUserStar',
});
