import { isNonEmptyString } from '@sniptt/guards';
import { type KnownBlock } from '@slack/web-api';

import { SLACK_ASSISTANT_FEEDBACK_ACTION_ID } from 'src/logic-functions/constants/slack-assistant-feedback-action-id';
import { SLACK_ASSISTANT_FEEDBACK_BUTTON_VALUE } from 'src/logic-functions/constants/slack-assistant-feedback-button-value';
import { SLACK_ASSISTANT_REQUEST_OBJECT_NAME } from 'src/logic-functions/constants/slack-assistant-request-object-name';
import { SLACK_MARKDOWN_BLOCK_MAX_LENGTH } from 'src/logic-functions/constants/slack-markdown-block-max-length';

const buildTruncationNotice = ({
  requestId,
  workspaceBaseUrl,
}: {
  requestId: string;
  workspaceBaseUrl: string | undefined;
}): string =>
  isNonEmptyString(workspaceBaseUrl)
    ? `\n\n_Shortened to fit Slack. [Read the full answer in Twenty](${workspaceBaseUrl}/object/${SLACK_ASSISTANT_REQUEST_OBJECT_NAME}/${requestId})_`
    : '\n\n_Shortened to fit Slack. The full answer is on this request in Twenty._';

const buildAnswerMarkdown = ({
  responseText,
  requestId,
  workspaceBaseUrl,
}: {
  responseText: string;
  requestId: string;
  workspaceBaseUrl: string | undefined;
}): string => {
  if (responseText.length <= SLACK_MARKDOWN_BLOCK_MAX_LENGTH) {
    return responseText;
  }

  const notice = buildTruncationNotice({ requestId, workspaceBaseUrl });
  const budget = Math.max(SLACK_MARKDOWN_BLOCK_MAX_LENGTH - notice.length, 0);
  const head = responseText.slice(0, budget);
  const lastLineBreakIndex = head.lastIndexOf('\n');

  // cutting mid-line would leave half a link or a bullet rendering as raw markdown
  const keptText =
    lastLineBreakIndex > budget / 2 ? head.slice(0, lastLineBreakIndex) : head;

  return `${keptText}${notice}`;
};

export const buildSlackAssistantAnswerBlocks = ({
  responseText,
  requestId,
  workspaceBaseUrl,
}: {
  responseText: string;
  requestId: string;
  workspaceBaseUrl?: string;
}): KnownBlock[] => [
  {
    type: 'markdown',
    text: buildAnswerMarkdown({ responseText, requestId, workspaceBaseUrl }),
  },
  {
    type: 'context_actions',
    block_id: requestId,
    elements: [
      {
        type: 'feedback_buttons',
        action_id: SLACK_ASSISTANT_FEEDBACK_ACTION_ID,
        positive_button: {
          text: { type: 'plain_text', text: 'Good response' },
          accessibility_label: 'Mark the assistant answer as a good response',
          value: SLACK_ASSISTANT_FEEDBACK_BUTTON_VALUE.POSITIVE,
        },
        negative_button: {
          text: { type: 'plain_text', text: 'Bad response' },
          accessibility_label: 'Mark the assistant answer as a bad response',
          value: SLACK_ASSISTANT_FEEDBACK_BUTTON_VALUE.NEGATIVE,
        },
      },
    ],
  },
];
