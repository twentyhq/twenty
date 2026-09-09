import { isNonEmptyArray } from '@sniptt/guards';

import { SLACK_ASSISTANT_EMPTY_REQUEST_TEXT } from 'src/logic-functions/constants/slack-assistant-empty-request-text';
import { SLACK_ASSISTANT_EMPTY_THREAD_REQUEST_TEXT } from 'src/logic-functions/constants/slack-assistant-empty-thread-request-text';
import { formatSlackFileNameAsCode } from 'src/logic-functions/utils/format-slack-file-name-as-code';

const buildSharedFileRequestText = (sharedFileNames: string[]): string => {
  const isSingleFile = sharedFileNames.length === 1;

  return [
    `Thanks for ${isSingleFile ? 'the file' : 'the files'}: ${sharedFileNames.map(formatSlackFileNameAsCode).join(', ')}.`,
    `I can see ${isSingleFile ? 'its name' : 'their names'} but I can't open ${isSingleFile ? 'it' : 'them'}, so tell me what you'd like done and I'll take it from there, for example "log this as a note on ACME" or "create a task to review this".`,
  ].join(' ');
};

export const buildSlackAssistantEmptyRequestText = ({
  sharedFileNames,
  isInExistingThread,
}: {
  sharedFileNames: string[];
  isInExistingThread: boolean;
}): string => {
  if (isNonEmptyArray(sharedFileNames)) {
    return buildSharedFileRequestText(sharedFileNames);
  }

  return isInExistingThread
    ? SLACK_ASSISTANT_EMPTY_THREAD_REQUEST_TEXT
    : SLACK_ASSISTANT_EMPTY_REQUEST_TEXT;
};
