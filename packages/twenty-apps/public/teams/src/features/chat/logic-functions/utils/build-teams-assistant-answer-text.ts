import { isNonEmptyString } from '@sniptt/guards';

import { TEAMS_ASSISTANT_REQUEST_OBJECT_NAME_SINGULAR } from 'src/features/chat/constants/teams-assistant-request-object-name-singular';
import { TEAMS_ANSWER_TEXT_MAX_BYTES } from 'src/features/chat/logic-functions/constants/teams-answer-text-max-bytes';
import {
  countUtf8Bytes,
  truncateToUtf8Bytes,
} from 'src/features/chat/logic-functions/utils/truncate-to-utf8-bytes';

const CODE_FENCE = '```';

const buildTruncationNotice = ({
  requestId,
  workspaceBaseUrl,
}: {
  requestId: string;
  workspaceBaseUrl: string | undefined;
}): string =>
  isNonEmptyString(workspaceBaseUrl)
    ? `\n\n_Shortened to fit Teams. [Read the full answer in Twenty](${workspaceBaseUrl}/object/${TEAMS_ASSISTANT_REQUEST_OBJECT_NAME_SINGULAR}/${requestId})_`
    : '\n\n_Shortened to fit Teams. The full answer is on this request in Twenty._';

const hasOpenCodeFence = (text: string): boolean =>
  text.split(CODE_FENCE).length % 2 === 0;

export const buildTeamsAssistantAnswerText = ({
  responseText,
  requestId,
  workspaceBaseUrl,
}: {
  responseText: string;
  requestId: string;
  workspaceBaseUrl: string | undefined;
}): string => {
  if (countUtf8Bytes(responseText) <= TEAMS_ANSWER_TEXT_MAX_BYTES) {
    return responseText;
  }

  const notice = buildTruncationNotice({ requestId, workspaceBaseUrl });
  const closingFence = `\n${CODE_FENCE}`;
  const budget = Math.max(
    TEAMS_ANSWER_TEXT_MAX_BYTES -
      countUtf8Bytes(notice) -
      countUtf8Bytes(closingFence),
    0,
  );
  const head = truncateToUtf8Bytes({ text: responseText, maxBytes: budget });
  const lastLineBreakIndex = head.lastIndexOf('\n');
  const lastWhitespaceIndex = head.search(/\s+\S*$/);
  const boundaryIndex =
    lastLineBreakIndex > head.length / 2
      ? lastLineBreakIndex
      : lastWhitespaceIndex;
  const keptText =
    boundaryIndex > head.length / 2 ? head.slice(0, boundaryIndex) : head;

  return `${keptText}${hasOpenCodeFence(keptText) ? closingFence : ''}${notice}`;
};
