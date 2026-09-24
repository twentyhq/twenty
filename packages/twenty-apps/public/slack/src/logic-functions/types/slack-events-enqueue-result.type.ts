import { type SlackAssistantRequestRecord } from 'src/logic-functions/types/slack-assistant-request-record.type';

export type SlackEventsEnqueueResult = {
  ok: boolean;
  skipped?: string;
  request?: SlackAssistantRequestRecord;
};
