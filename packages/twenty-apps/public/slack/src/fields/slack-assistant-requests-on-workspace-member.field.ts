import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  SLACK_ASSISTANT_REQUEST_OBJECT_UNIVERSAL_IDENTIFIER,
  SLACK_ASSISTANT_REQUEST_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_ASSISTANT_REQUESTS_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    SLACK_ASSISTANT_REQUESTS_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.RELATION,
  name: 'slackAssistantRequests',
  label: 'Slack assistant requests',
  description: 'Slack requests the assistant ran as this member.',
  icon: 'IconBrandSlack',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier:
    SLACK_ASSISTANT_REQUEST_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    SLACK_ASSISTANT_REQUEST_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
  isUIEditable: false,
});
