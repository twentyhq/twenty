import { type SlackPostMessageInput } from 'src/logic-functions/types/slack-post-message-input.type';
import { type SlackRecordPreviewScope } from 'src/logic-functions/types/slack-record-preview-scope.type';

export type SlackDeliverMessagePayload = SlackPostMessageInput & {
  attempt?: number;
  slackAssistantRequestId?: string;
  recordPreviewScope?: SlackRecordPreviewScope;
};
