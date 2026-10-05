import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  SLACK_USER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
  SLACK_USER_LINK_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_USER_LINKS_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    SLACK_USER_LINKS_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.RELATION,
  name: 'slackUserLinks',
  label: 'Slack accounts',
  description: 'Slack accounts the assistant treats as this member.',
  icon: 'IconBrandSlack',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier:
    SLACK_USER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    SLACK_USER_LINK_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
  isUIEditable: false,
});
