import {
  defineObject,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { TELEGRAM_ASSISTANT_REQUEST_OBJECT_NAME_SINGULAR } from 'src/constants/telegram-assistant-request-object-name-singular';
import {
  TELEGRAM_ASSISTANT_REQUEST_CHAT_ID_FIELD_UNIVERSAL_IDENTIFIER,
  TELEGRAM_ASSISTANT_REQUEST_ERROR_FIELD_UNIVERSAL_IDENTIFIER,
  TELEGRAM_ASSISTANT_REQUEST_FEEDBACK_FIELD_UNIVERSAL_IDENTIFIER,
  TELEGRAM_ASSISTANT_REQUEST_MESSAGE_ID_FIELD_UNIVERSAL_IDENTIFIER,
  TELEGRAM_ASSISTANT_REQUEST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  TELEGRAM_ASSISTANT_REQUEST_OBJECT_UNIVERSAL_IDENTIFIER,
  TELEGRAM_ASSISTANT_REQUEST_RESPONSE_FIELD_UNIVERSAL_IDENTIFIER,
  TELEGRAM_ASSISTANT_REQUEST_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  TELEGRAM_ASSISTANT_REQUEST_TEXT_FIELD_UNIVERSAL_IDENTIFIER,
  TELEGRAM_ASSISTANT_REQUEST_USER_ID_FIELD_UNIVERSAL_IDENTIFIER,
  TELEGRAM_ASSISTANT_REQUEST_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  TELEGRAM_ASSISTANT_REQUESTS_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { TELEGRAM_ASSISTANT_FEEDBACK } from 'src/logic-functions/constants/telegram-assistant-feedback';
import { TELEGRAM_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/telegram-assistant-request-status';

export default defineObject({
  universalIdentifier: TELEGRAM_ASSISTANT_REQUEST_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: TELEGRAM_ASSISTANT_REQUEST_OBJECT_NAME_SINGULAR,
  namePlural: 'telegramAssistantRequests',
  labelSingular: 'Telegram Assistant Request',
  labelPlural: 'Telegram Assistant Requests',
  description:
    'A request sent to the Twenty assistant in a Telegram direct chat, with its processing status and response.',
  icon: 'IconMessage',
  labelIdentifierFieldMetadataUniversalIdentifier:
    TELEGRAM_ASSISTANT_REQUEST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier:
        TELEGRAM_ASSISTANT_REQUEST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Name',
      description: 'Start of the request text',
      icon: 'IconAbc',
      name: 'name',
    },
    {
      universalIdentifier:
        TELEGRAM_ASSISTANT_REQUEST_CHAT_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Telegram chat ID',
      description: 'Direct chat the request was sent in',
      icon: 'IconMessages',
      name: 'telegramChatId',
    },
    {
      universalIdentifier:
        TELEGRAM_ASSISTANT_REQUEST_MESSAGE_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Telegram message ID',
      description:
        'Id of the message in its chat, used to record each message once',
      icon: 'IconHash',
      name: 'telegramMessageId',
    },
    {
      universalIdentifier:
        TELEGRAM_ASSISTANT_REQUEST_USER_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Telegram user ID',
      description: 'Telegram account that sent the request',
      icon: 'IconUser',
      name: 'telegramUserId',
    },
    {
      universalIdentifier:
        TELEGRAM_ASSISTANT_REQUEST_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.RELATION,
      label: 'Ran as',
      description: 'Workspace member the assistant acted as',
      icon: 'IconUserCircle',
      name: 'workspaceMember',
      isNullable: true,
      relationTargetObjectMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember
          .universalIdentifier,
      relationTargetFieldMetadataUniversalIdentifier:
        TELEGRAM_ASSISTANT_REQUESTS_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: OnDeleteAction.SET_NULL,
        joinColumnName: 'workspaceMemberId',
      },
    },
    {
      universalIdentifier:
        TELEGRAM_ASSISTANT_REQUEST_TEXT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.RICH_TEXT,
      label: 'Request',
      description: 'Message text the member sent',
      icon: 'IconMessage',
      name: 'requestText',
    },
    {
      universalIdentifier:
        TELEGRAM_ASSISTANT_REQUEST_RESPONSE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.RICH_TEXT,
      label: 'Response',
      description: 'Assistant answer sent back to Telegram',
      icon: 'IconMessageReply',
      name: 'responseText',
    },
    {
      universalIdentifier:
        TELEGRAM_ASSISTANT_REQUEST_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      label: 'Status',
      description: 'Where the request is in its processing',
      icon: 'IconProgress',
      defaultValue: `'${TELEGRAM_ASSISTANT_REQUEST_STATUS.PENDING}'`,
      options: [
        {
          id: '7c3ef56a-14e6-4373-a976-22b82ed1a2f5',
          value: TELEGRAM_ASSISTANT_REQUEST_STATUS.PENDING,
          label: 'Pending',
          position: 0,
          color: 'gray',
        },
        {
          id: 'ec623384-9137-4188-a4b7-f21f70087ac9',
          value: TELEGRAM_ASSISTANT_REQUEST_STATUS.PROCESSING,
          label: 'Processing',
          position: 1,
          color: 'blue',
        },
        {
          id: 'a04a7acd-fb37-423b-8f0a-9ef544e65086',
          value: TELEGRAM_ASSISTANT_REQUEST_STATUS.STILL_RUNNING,
          label: 'Still running',
          position: 2,
          color: 'orange',
        },
        {
          id: '124bfe2e-cd02-4a60-990c-99f20f431891',
          value: TELEGRAM_ASSISTANT_REQUEST_STATUS.DONE,
          label: 'Done',
          position: 3,
          color: 'green',
        },
        {
          id: 'fb5be0f3-9740-4857-964d-07563b153cbe',
          value: TELEGRAM_ASSISTANT_REQUEST_STATUS.FAILED,
          label: 'Failed',
          position: 4,
          color: 'red',
        },
      ],
      name: 'status',
    },
    {
      universalIdentifier:
        TELEGRAM_ASSISTANT_REQUEST_FEEDBACK_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      label: 'Feedback',
      description: 'Thumbs up or down the member gave the answer in Telegram',
      icon: 'IconThumbUp',
      isNullable: true,
      options: [
        {
          id: 'd2822e05-11e3-4e11-b908-135357b9f7ab',
          value: TELEGRAM_ASSISTANT_FEEDBACK.POSITIVE,
          label: 'Positive',
          position: 0,
          color: 'green',
        },
        {
          id: '2f0d3065-db23-45da-95a6-22a18ddd95cd',
          value: TELEGRAM_ASSISTANT_FEEDBACK.NEGATIVE,
          label: 'Negative',
          position: 1,
          color: 'red',
        },
      ],
      name: 'feedback',
    },
    {
      universalIdentifier:
        TELEGRAM_ASSISTANT_REQUEST_ERROR_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Error',
      description: 'Why the request failed, for admins',
      icon: 'IconAlertTriangle',
      name: 'errorMessage',
    },
  ],
});
