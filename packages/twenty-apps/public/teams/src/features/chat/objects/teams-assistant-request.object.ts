import {
  defineObject,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  TEAMS_ASSISTANT_REQUEST_ACTIVITY_ID_FIELD_UNIVERSAL_IDENTIFIER,
  TEAMS_ASSISTANT_REQUEST_CONVERSATION_ID_FIELD_UNIVERSAL_IDENTIFIER,
  TEAMS_ASSISTANT_REQUEST_CONVERSATION_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
  TEAMS_ASSISTANT_REQUEST_ERROR_FIELD_UNIVERSAL_IDENTIFIER,
  TEAMS_ASSISTANT_REQUEST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  TEAMS_ASSISTANT_REQUEST_OBJECT_UNIVERSAL_IDENTIFIER,
  TEAMS_ASSISTANT_REQUEST_RESPONSE_FIELD_UNIVERSAL_IDENTIFIER,
  TEAMS_ASSISTANT_REQUEST_SERVICE_URL_FIELD_UNIVERSAL_IDENTIFIER,
  TEAMS_ASSISTANT_REQUEST_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  TEAMS_ASSISTANT_REQUEST_TENANT_ID_FIELD_UNIVERSAL_IDENTIFIER,
  TEAMS_ASSISTANT_REQUEST_TEXT_FIELD_UNIVERSAL_IDENTIFIER,
  TEAMS_ASSISTANT_REQUEST_USER_AAD_OBJECT_ID_FIELD_UNIVERSAL_IDENTIFIER,
  TEAMS_ASSISTANT_REQUEST_USER_ID_FIELD_UNIVERSAL_IDENTIFIER,
  TEAMS_ASSISTANT_REQUEST_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  TEAMS_ASSISTANT_REQUESTS_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/features/chat/constants/universal-identifiers';
import { TEAMS_ASSISTANT_REQUEST_STATUS } from 'src/features/chat/logic-functions/constants/teams-assistant-request-status';

export default defineObject({
  universalIdentifier: TEAMS_ASSISTANT_REQUEST_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'teamsAssistantRequest',
  namePlural: 'teamsAssistantRequests',
  labelSingular: 'Teams Assistant Request',
  labelPlural: 'Teams Assistant Requests',
  description:
    'A request sent to the Twenty assistant from Microsoft Teams (mention or personal chat), with its processing status and response.',
  icon: 'IconMessage',
  labelIdentifierFieldMetadataUniversalIdentifier:
    TEAMS_ASSISTANT_REQUEST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier:
        TEAMS_ASSISTANT_REQUEST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Name',
      description: 'Short preview of the request',
      icon: 'IconAbc',
      name: 'name',
    },
    {
      universalIdentifier:
        TEAMS_ASSISTANT_REQUEST_ACTIVITY_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Teams activity ID',
      description:
        'Bot Framework activity id of the message, used with the conversation id for deduplication',
      icon: 'IconHash',
      name: 'teamsActivityId',
    },
    {
      universalIdentifier:
        TEAMS_ASSISTANT_REQUEST_CONVERSATION_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Teams conversation ID',
      description: 'Chat or channel thread the request came from',
      icon: 'IconHash',
      name: 'teamsConversationId',
    },
    {
      universalIdentifier:
        TEAMS_ASSISTANT_REQUEST_CONVERSATION_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Teams conversation type',
      description: 'Teams conversationType (personal, groupChat, channel)',
      icon: 'IconHash',
      name: 'teamsConversationType',
    },
    {
      universalIdentifier:
        TEAMS_ASSISTANT_REQUEST_SERVICE_URL_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Teams service URL',
      description: 'Verified Bot Connector endpoint the answer is posted to',
      icon: 'IconLink',
      name: 'teamsServiceUrl',
    },
    {
      universalIdentifier:
        TEAMS_ASSISTANT_REQUEST_TENANT_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Microsoft tenant ID',
      description: 'Microsoft tenant the request came from',
      icon: 'IconBuilding',
      name: 'teamsTenantId',
    },
    {
      universalIdentifier:
        TEAMS_ASSISTANT_REQUEST_USER_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Teams user ID',
      description: 'Teams user who sent the request',
      icon: 'IconUser',
      name: 'teamsUserId',
    },
    {
      universalIdentifier:
        TEAMS_ASSISTANT_REQUEST_USER_AAD_OBJECT_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Microsoft Entra user ID',
      description: 'Entra object id of the sender, when Teams provides it',
      icon: 'IconUser',
      name: 'teamsUserAadObjectId',
    },
    {
      universalIdentifier:
        TEAMS_ASSISTANT_REQUEST_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.RELATION,
      label: 'Ran as',
      description:
        'Workspace member the assistant acted as; empty when the Teams account is not mapped',
      icon: 'IconUserCircle',
      name: 'workspaceMember',
      isNullable: true,
      relationTargetObjectMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember
          .universalIdentifier,
      relationTargetFieldMetadataUniversalIdentifier:
        TEAMS_ASSISTANT_REQUESTS_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: OnDeleteAction.SET_NULL,
        joinColumnName: 'workspaceMemberId',
      },
    },
    {
      universalIdentifier:
        TEAMS_ASSISTANT_REQUEST_TEXT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.RICH_TEXT,
      label: 'Request',
      description: 'Message text with the bot mention stripped',
      icon: 'IconMessage',
      name: 'requestText',
    },
    {
      universalIdentifier:
        TEAMS_ASSISTANT_REQUEST_RESPONSE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.RICH_TEXT,
      label: 'Response',
      description: 'Assistant answer posted back to Teams',
      icon: 'IconMessageReply',
      name: 'responseText',
    },
    {
      universalIdentifier:
        TEAMS_ASSISTANT_REQUEST_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      label: 'Status',
      icon: 'IconProgress',
      defaultValue: `'${TEAMS_ASSISTANT_REQUEST_STATUS.PENDING}'`,
      options: [
        {
          id: 'aebd04b2-426d-4137-8ffb-93ed1f10a2f7',
          value: TEAMS_ASSISTANT_REQUEST_STATUS.PENDING,
          label: 'Pending',
          position: 0,
          color: 'gray',
        },
        {
          id: '8bc52347-9bc3-4424-9309-259c2a7a7b60',
          value: TEAMS_ASSISTANT_REQUEST_STATUS.PROCESSING,
          label: 'Processing',
          position: 1,
          color: 'blue',
        },
        {
          id: '6fcf9ea7-ff9e-4f2c-8f33-13c99eb5a457',
          value: TEAMS_ASSISTANT_REQUEST_STATUS.DONE,
          label: 'Done',
          position: 2,
          color: 'green',
        },
        {
          id: '6f4098c6-fb33-4da7-a165-2e2e394dc86b',
          value: TEAMS_ASSISTANT_REQUEST_STATUS.FAILED,
          label: 'Failed',
          position: 3,
          color: 'red',
        },
      ],
      name: 'status',
    },
    {
      universalIdentifier:
        TEAMS_ASSISTANT_REQUEST_ERROR_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Error',
      description: 'Failure reason when the assistant could not answer',
      icon: 'IconAlertTriangle',
      name: 'errorMessage',
    },
  ],
});
