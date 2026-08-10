import { type KnownBlock, type MessageAttachment } from '@slack/web-api';

import { type SlackMessageBodyFormat } from 'src/logic-functions/types/slack-message-body-format.type';

export type SlackMessageBody = {
  messageFormat?: SlackMessageBodyFormat;
  messageBlocks?: KnownBlock[];
  messageAttachments?: MessageAttachment[];
};
