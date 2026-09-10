import { type SlackRecordPreviewScope } from 'src/logic-functions/types/slack-record-preview-scope.type';

export type SlackPostMessageOptions = {
  waitOutRateLimit?: boolean;
  recordPreviewScope?: SlackRecordPreviewScope;
};
