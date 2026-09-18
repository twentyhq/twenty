import { type SlackMessageFile } from 'src/logic-functions/types/slack-message-file.type';

export type ResolvedSlackFileDetails = {
  file: SlackMessageFile;
  isFilesReadScopeMissing: boolean;
};
