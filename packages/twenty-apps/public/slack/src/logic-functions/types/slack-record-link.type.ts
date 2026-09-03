import { type SlackUnfurlObjectName } from 'src/logic-functions/types/slack-unfurl-object-name.type';

export type SlackRecordLink = {
  sharedUrl: string;
  canonicalUrl: string;
  objectNameSingular: SlackUnfurlObjectName;
  recordId: string;
};
