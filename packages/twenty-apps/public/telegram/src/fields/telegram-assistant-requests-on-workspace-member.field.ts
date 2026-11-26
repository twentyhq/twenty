import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  TELEGRAM_ASSISTANT_REQUEST_OBJECT_UNIVERSAL_IDENTIFIER,
  TELEGRAM_ASSISTANT_REQUEST_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  TELEGRAM_ASSISTANT_REQUESTS_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    TELEGRAM_ASSISTANT_REQUESTS_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.RELATION,
  name: 'telegramAssistantRequests',
  label: 'Telegram assistant requests',
  description: 'Telegram requests the assistant ran as this member.',
  icon: 'IconMessage',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier:
    TELEGRAM_ASSISTANT_REQUEST_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    TELEGRAM_ASSISTANT_REQUEST_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
  isUIEditable: false,
});
