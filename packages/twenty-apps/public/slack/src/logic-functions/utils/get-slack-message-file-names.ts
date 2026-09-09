import { isNonEmptyString } from '@sniptt/guards';

import { type SlackMessageFile } from 'src/logic-functions/types/slack-message-file.type';

const UNNAMED_SLACK_FILE_LABEL = 'an unnamed file';

const SLACK_FILE_NAME_MAX_LENGTH = 100;

const normalizeSlackFileName = (fileName: string | undefined): string => {
  const singleLineName = (fileName ?? '').replace(/\s+/g, ' ').trim();

  return singleLineName.length > SLACK_FILE_NAME_MAX_LENGTH
    ? `${singleLineName.slice(0, SLACK_FILE_NAME_MAX_LENGTH)}…`
    : singleLineName;
};

const getSlackMessageFileName = (file: SlackMessageFile): string => {
  const normalizedName = normalizeSlackFileName(file.name);

  if (isNonEmptyString(normalizedName)) {
    return normalizedName;
  }

  const normalizedTitle = normalizeSlackFileName(file.title);

  if (isNonEmptyString(normalizedTitle)) {
    return normalizedTitle;
  }

  return UNNAMED_SLACK_FILE_LABEL;
};

export const getSlackMessageFileNames = (
  files: SlackMessageFile[] | undefined,
): string[] => (files ?? []).map(getSlackMessageFileName);
