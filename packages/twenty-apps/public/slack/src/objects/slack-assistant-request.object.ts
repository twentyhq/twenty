import { defineObject, FieldType } from 'twenty-sdk/define';

import {
  SLACK_ASSISTANT_REQUEST_CHANNEL_ID_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_ASSISTANT_REQUEST_CHANNEL_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_ASSISTANT_REQUEST_ERROR_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_ASSISTANT_REQUEST_EVENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_ASSISTANT_REQUEST_MESSAGE_TS_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_ASSISTANT_REQUEST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_ASSISTANT_REQUEST_OBJECT_UNIVERSAL_IDENTIFIER,
  SLACK_ASSISTANT_REQUEST_RESPONSE_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_ASSISTANT_REQUEST_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_ASSISTANT_REQUEST_TEXT_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_ASSISTANT_REQUEST_THREAD_TS_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_ASSISTANT_REQUEST_USER_ID_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';

export default defineObject({
  universalIdentifier: SLACK_ASSISTANT_REQUEST_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'slackAssistantRequest',
  namePlural: 'slackAssistantRequests',
  labelSingular: 'Slack Assistant Request',
  labelPlural: 'Slack Assistant Requests',
  description:
    'A request sent to the Twenty assistant from Slack (mention or DM), with its processing status and response.',
  icon: 'IconBrandSlack',
  labelIdentifierFieldMetadataUniversalIdentifier:
    SLACK_ASSISTANT_REQUEST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: SLACK_ASSISTANT_REQUEST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Name',
      description: 'Short preview of the request',
      icon: 'IconAbc',
      name: 'name',
    },
    {
      universalIdentifier:
        SLACK_ASSISTANT_REQUEST_EVENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Slack event ID',
      description: 'Slack Events API event_id, used for deduplication',
      icon: 'IconHash',
      name: 'slackEventId',
    },
    {
      universalIdentifier:
        SLACK_ASSISTANT_REQUEST_CHANNEL_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Slack channel ID',
      description: 'Channel or DM the request came from',
      icon: 'IconHash',
      name: 'slackChannelId',
    },
    {
      universalIdentifier:
        SLACK_ASSISTANT_REQUEST_CHANNEL_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Slack channel type',
      description: 'Slack channel_type (channel, group, im)',
      icon: 'IconHash',
      name: 'slackChannelType',
    },
    {
      universalIdentifier:
        SLACK_ASSISTANT_REQUEST_THREAD_TS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Slack thread timestamp',
      description: 'thread_ts when the request was made inside a thread',
      icon: 'IconClock',
      name: 'slackThreadTimestamp',
    },
    {
      universalIdentifier:
        SLACK_ASSISTANT_REQUEST_MESSAGE_TS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Slack message timestamp',
      description: 'ts of the message that triggered the request',
      icon: 'IconClock',
      name: 'slackMessageTimestamp',
    },
    {
      universalIdentifier:
        SLACK_ASSISTANT_REQUEST_USER_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Slack user ID',
      description: 'Slack user who sent the request',
      icon: 'IconUser',
      name: 'slackUserId',
    },
    {
      universalIdentifier: SLACK_ASSISTANT_REQUEST_TEXT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Request',
      description: 'Message text with the bot mention stripped',
      icon: 'IconMessage',
      name: 'requestText',
    },
    {
      universalIdentifier:
        SLACK_ASSISTANT_REQUEST_RESPONSE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Response',
      description: 'Assistant answer posted back to Slack',
      icon: 'IconMessageReply',
      name: 'responseText',
    },
    {
      universalIdentifier:
        SLACK_ASSISTANT_REQUEST_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      label: 'Status',
      icon: 'IconProgress',
      defaultValue: `'${SLACK_ASSISTANT_REQUEST_STATUS.PENDING}'`,
      options: [
        {
          id: '55ffa39f-a7ba-4f6f-bca2-5493eba5c3bc',
          value: SLACK_ASSISTANT_REQUEST_STATUS.PENDING,
          label: 'Pending',
          position: 0,
          color: 'gray',
        },
        {
          id: '0b1df903-918d-40df-90c0-c6f1ab38dd3b',
          value: SLACK_ASSISTANT_REQUEST_STATUS.PROCESSING,
          label: 'Processing',
          position: 1,
          color: 'blue',
        },
        {
          id: '0e2e4bfb-47ad-4f30-ad8d-19561d62e4b1',
          value: SLACK_ASSISTANT_REQUEST_STATUS.DONE,
          label: 'Done',
          position: 2,
          color: 'green',
        },
        {
          id: 'bb094393-d27b-47d8-9a7b-2d4d5bf1caa0',
          value: SLACK_ASSISTANT_REQUEST_STATUS.FAILED,
          label: 'Failed',
          position: 3,
          color: 'red',
        },
      ],
      name: 'status',
    },
    {
      universalIdentifier:
        SLACK_ASSISTANT_REQUEST_ERROR_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Error',
      description: 'Failure reason when the assistant could not answer',
      icon: 'IconAlertTriangle',
      name: 'errorMessage',
    },
  ],
});
