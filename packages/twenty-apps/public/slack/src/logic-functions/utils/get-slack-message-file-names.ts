import { isNonEmptyString } from '@sniptt/guards';

import { type SlackMessageFile } from 'src/logic-functions/types/slack-message-file.type';

// Slack Connect and restricted files arrive as stubs without a name, and the
// app has no files:read scope to look them up
const UNNAMED_SLACK_FILE_LABEL = 'an unnamed file';

const getSlackMessageFileName = (file: SlackMessageFile): string => {
  if (isNonEmptyString(file.name)) {
    return file.name;
  }

  if (isNonEmptyString(file.title)) {
    return file.title;
  }

  return UNNAMED_SLACK_FILE_LABEL;
};

export const getSlackMessageFileNames = (
  files: SlackMessageFile[] | undefined,
): string[] => (files ?? []).map(getSlackMessageFileName);
