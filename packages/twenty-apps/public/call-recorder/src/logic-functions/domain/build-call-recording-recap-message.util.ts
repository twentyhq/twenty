import { isDefined } from 'twenty-sdk/utils';

import { extractCallRecordingSummaryActionItems } from 'src/logic-functions/domain/extract-call-recording-summary-action-items.util';
import { extractCallRecordingSummaryGist } from 'src/logic-functions/domain/extract-call-recording-summary-gist.util';
import { type InboxMessage } from 'src/logic-functions/types/inbox-message.type';

const FOLLOW_UP_QUESTION: NonNullable<InboxMessage['toolCall']> = {
  toolName: 'ask_question',
  input: {
    header: 'Follow-up',
    question: 'Do you want a hand with the follow-up?',
    options: [
      { label: 'Create the follow-up tasks' },
      { label: 'Draft a follow-up email' },
    ],
  },
};

export const buildCallRecordingRecapMessage = ({
  callRecordingId,
  workspaceMemberId,
  callRecordingReference,
  calendarEventTitle,
  summaryMarkdown,
}: {
  callRecordingId: string;
  workspaceMemberId: string;
  callRecordingReference: string;
  calendarEventTitle: string | undefined;
  summaryMarkdown: string;
}): InboxMessage => {
  const messageKey = `call-recording-recap-${callRecordingId}-${workspaceMemberId}`;
  const gist = extractCallRecordingSummaryGist(summaryMarkdown);
  const actionItems = extractCallRecordingSummaryActionItems(summaryMarkdown);
  const hasRecap = isDefined(gist) || isDefined(actionItems);

  return {
    threadKey: messageKey,
    idempotencyKey: messageKey,
    title: calendarEventTitle ?? 'Call recap',
    text: [
      gist,
      isDefined(actionItems) ? `**Action items**\n\n${actionItems}` : undefined,
      hasRecap
        ? callRecordingReference
        : `Your call was recorded: ${callRecordingReference}.`,
    ]
      .filter(isDefined)
      .join('\n\n'),
    ...(isDefined(actionItems) ? { toolCall: FOLLOW_UP_QUESTION } : {}),
  };
};
