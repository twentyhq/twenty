import { isNonEmptyString } from '@sniptt/guards';

import { TEAMS_ANSWER_TEXT_MAX_LENGTH } from 'src/features/chat/logic-functions/constants/teams-answer-text-max-length';
import { truncateOnGraphemeBoundary } from 'src/features/chat/logic-functions/utils/truncate-on-grapheme-boundary';

const TEAMS_ASSISTANT_REQUEST_OBJECT_NAME = 'teamsAssistantRequest';

const buildTruncationNotice = ({
  requestId,
  workspaceBaseUrl,
}: {
  requestId: string;
  workspaceBaseUrl: string | undefined;
}): string =>
  isNonEmptyString(workspaceBaseUrl)
    ? `\n\n_Shortened to fit Teams. [Read the full answer in Twenty](${workspaceBaseUrl}/object/${TEAMS_ASSISTANT_REQUEST_OBJECT_NAME}/${requestId})_`
    : '\n\n_Shortened to fit Teams. The full answer is on this request in Twenty._';

export const buildTeamsAssistantAnswerText = ({
  responseText,
  requestId,
  workspaceBaseUrl,
}: {
  responseText: string;
  requestId: string;
  workspaceBaseUrl: string | undefined;
}): string => {
  if (responseText.length <= TEAMS_ANSWER_TEXT_MAX_LENGTH) {
    return responseText;
  }

  const notice = buildTruncationNotice({ requestId, workspaceBaseUrl });
  const budget = Math.max(TEAMS_ANSWER_TEXT_MAX_LENGTH - notice.length, 0);
  const head = truncateOnGraphemeBoundary({
    text: responseText,
    maxLength: budget,
  });
  const lastLineBreakIndex = head.lastIndexOf('\n');
  const lastWhitespaceIndex = head.search(/\s+\S*$/);
  const boundaryIndex =
    lastLineBreakIndex > budget / 2 ? lastLineBreakIndex : lastWhitespaceIndex;
  const keptText =
    boundaryIndex > budget / 2 ? head.slice(0, boundaryIndex) : head;

  return `${keptText}${notice}`;
};
