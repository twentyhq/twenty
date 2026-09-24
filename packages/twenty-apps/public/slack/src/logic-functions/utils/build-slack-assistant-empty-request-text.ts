import { isNonEmptyArray } from '@sniptt/guards';

import { SLACK_ASSISTANT_EMPTY_REQUEST_TEXT } from 'src/logic-functions/constants/slack-assistant-empty-request-text';
import { SLACK_ASSISTANT_EMPTY_THREAD_REQUEST_TEXT } from 'src/logic-functions/constants/slack-assistant-empty-thread-request-text';
import { formatSlackFileNameAsCode } from 'src/logic-functions/utils/format-slack-file-name-as-code';

const NEXT_STEP_HINT_TEXT =
  'so tell me what you\'d like done and I\'ll take it from there, for example "log this as a note on ACME" or "create a task to review this".';

const buildSharedFilesAcknowledgement = (sharedFileNames: string[]): string => {
  const fileNamesAsCode = sharedFileNames
    .map(formatSlackFileNameAsCode)
    .join(', ');

  if (sharedFileNames.length === 1) {
    return `Thanks for the file: ${fileNamesAsCode}. I can see its name but I can't open it,`;
  }

  return `Thanks for the files: ${fileNamesAsCode}. I can see their names but I can't open them,`;
};

export const buildSlackAssistantEmptyRequestText = ({
  sharedFileNames,
  isInExistingThread,
}: {
  sharedFileNames: string[];
  isInExistingThread: boolean;
}): string => {
  if (isNonEmptyArray(sharedFileNames)) {
    return `${buildSharedFilesAcknowledgement(sharedFileNames)} ${NEXT_STEP_HINT_TEXT}`;
  }

  return isInExistingThread
    ? SLACK_ASSISTANT_EMPTY_THREAD_REQUEST_TEXT
    : SLACK_ASSISTANT_EMPTY_REQUEST_TEXT;
};
