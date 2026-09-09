import { isNonEmptyString } from '@sniptt/guards';

import { type SlackMessageFile } from 'src/logic-functions/types/slack-message-file.type';

// Slack Connect and restricted files arrive as stubs without a name, and the
// app has no files:read scope to look them up
const UNNAMED_SLACK_FILE_LABEL = 'an unnamed file';

// a file name is member-controlled text: keep it to one short line so it
// cannot pad out a reply or forge structure in the agent prompt
const SLACK_FILE_NAME_MAX_LENGTH = 100;

const normalizeSlackFileName = (fileName: string): string => {
  const singleLineName = fileName.replace(/\s+/g, ' ').trim();

  return singleLineName.length > SLACK_FILE_NAME_MAX_LENGTH
    ? `${singleLineName.slice(0, SLACK_FILE_NAME_MAX_LENGTH)}…`
    : singleLineName;
};

const getSlackMessageFileName = (file: SlackMessageFile): string => {
  if (isNonEmptyString(file.name)) {
    return normalizeSlackFileName(file.name);
  }

  if (isNonEmptyString(file.title)) {
    return normalizeSlackFileName(file.title);
  }

  return UNNAMED_SLACK_FILE_LABEL;
};

export const getSlackMessageFileNames = (
  files: SlackMessageFile[] | undefined,
): string[] =>
  (files ?? [])
    .map(getSlackMessageFileName)
    .filter((fileName) => isNonEmptyString(fileName));
