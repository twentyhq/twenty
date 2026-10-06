import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  TEAMS_ASSISTANT_REQUEST_OBJECT_UNIVERSAL_IDENTIFIER,
  TEAMS_ASSISTANT_REQUEST_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  TEAMS_ASSISTANT_REQUESTS_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/features/chat/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    TEAMS_ASSISTANT_REQUESTS_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.RELATION,
  name: 'teamsAssistantRequests',
  label: 'Teams assistant requests',
  description: 'Teams requests the assistant ran as this member.',
  icon: 'IconBrandTeams',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier:
    TEAMS_ASSISTANT_REQUEST_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    TEAMS_ASSISTANT_REQUEST_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
  isUIEditable: false,
});
