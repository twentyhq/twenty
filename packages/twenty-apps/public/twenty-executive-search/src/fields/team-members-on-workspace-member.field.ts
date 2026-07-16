import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  defineField,
  FieldType,
  RelationType,
} from 'twenty-sdk/define';

import {
  ASSIGNMENT_TEAM_MEMBER_OBJECT_UNIVERSAL_IDENTIFIER,
  ASSIGNMENT_TEAM_MEMBER_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  TEAM_MEMBERS_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    TEAM_MEMBERS_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  name: 'assignmentTeamMembers',
  label: 'Assignment Team Members',
  description: 'Team memberships in search assignments for this user.',
  type: FieldType.RELATION,
  relationTargetFieldMetadataUniversalIdentifier:
    ASSIGNMENT_TEAM_MEMBER_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  relationTargetObjectMetadataUniversalIdentifier:
    ASSIGNMENT_TEAM_MEMBER_OBJECT_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  isNullable: true,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
