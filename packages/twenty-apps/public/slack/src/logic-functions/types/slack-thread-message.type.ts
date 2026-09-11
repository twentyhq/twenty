import { type SlackMessageFile } from 'src/logic-functions/types/slack-message-file.type';

export type SlackThreadMessage = {
  ts?: string;
  user?: string;
  bot_id?: string;
  text?: string;
  files?: SlackMessageFile[];
};
