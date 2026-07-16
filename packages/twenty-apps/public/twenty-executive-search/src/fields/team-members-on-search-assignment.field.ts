import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

import {
  ASSIGNMENT_TEAM_MEMBER_OBJECT_UNIVERSAL_IDENTIFIER,
  ASSIGNMENT_TEAM_MEMBER_SEARCH_ASSIGNMENT_FIELD_UNIVERSAL_IDENTIFIER,
  SEARCH_ASSIGNMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  TEAM_MEMBERS_ON_SEARCH_ASSIGNMENT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    TEAM_MEMBERS_ON_SEARCH_ASSIGNMENT_FIELD_UNIVERSAL_IDENTIFIER,
  name: 'assignmentTeamMembers',
  label: 'Team Members',
  description: 'Team members assigned to this search.',
  type: FieldType.RELATION,
  relationTargetFieldMetadataUniversalIdentifier:
    ASSIGNMENT_TEAM_MEMBER_SEARCH_ASSIGNMENT_FIELD_UNIVERSAL_IDENTIFIER,
  relationTargetObjectMetadataUniversalIdentifier:
    ASSIGNMENT_TEAM_MEMBER_OBJECT_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: SEARCH_ASSIGNMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  isNullable: true,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
