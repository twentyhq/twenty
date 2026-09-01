import { type SlackUnfurlObjectName } from 'src/logic-functions/types/slack-unfurl-object-name.type';

export type SlackRecordLink = {
  url: string;
  objectNameSingular: SlackUnfurlObjectName;
  recordId: string;
};
