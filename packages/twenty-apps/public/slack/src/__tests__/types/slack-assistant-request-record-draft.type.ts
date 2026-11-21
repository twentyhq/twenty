import { type SlackAssistantRequestStatus } from 'src/logic-functions/types/slack-assistant-request-status.type';

export type SlackAssistantRequestRecordDraft = {
  slackChannelId: string;
  slackMessageTimestamp: string;
  slackUserId: string;
  requestText: string;
  slackChannelType?: string;
  slackThreadTimestamp?: string;
  status?: SlackAssistantRequestStatus;
  responseText?: string;
};
