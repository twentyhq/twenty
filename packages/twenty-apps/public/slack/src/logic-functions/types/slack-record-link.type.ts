import { type SlackUnfurlObjectName } from 'src/logic-functions/constants/slack-unfurl-object-names';

export type SlackRecordLink = {
  url: string;
  objectNameSingular: SlackUnfurlObjectName;
  recordId: string;
};
