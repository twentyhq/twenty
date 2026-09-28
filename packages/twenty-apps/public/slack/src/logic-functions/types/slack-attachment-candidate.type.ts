import { type SlackMessageFile } from 'src/logic-functions/types/slack-message-file.type';

export type SlackAttachmentCandidate = SlackMessageFile & {
  url_private: string;
  mimetype: string;
};
