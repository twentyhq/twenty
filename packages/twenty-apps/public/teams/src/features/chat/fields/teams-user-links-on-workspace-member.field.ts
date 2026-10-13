import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  TEAMS_USER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
  TEAMS_USER_LINK_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  TEAMS_USER_LINKS_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/features/chat/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    TEAMS_USER_LINKS_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.RELATION,
  name: 'teamsUserLinks',
  label: 'Teams accounts',
  description: 'Teams accounts the assistant treats as this member.',
  icon: 'IconLink',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier:
    TEAMS_USER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    TEAMS_USER_LINK_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
  isUIEditable: false,
});
