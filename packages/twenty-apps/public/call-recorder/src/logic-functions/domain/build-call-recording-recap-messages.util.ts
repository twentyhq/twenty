import { isDefined } from 'twenty-sdk/utils';

import { SHOW_CALL_RECORDING_MEETING_CARD_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { extractCallRecordingSummaryActionItems } from 'src/logic-functions/domain/extract-call-recording-summary-action-items.util';
import { extractCallRecordingSummaryGist } from 'src/logic-functions/domain/extract-call-recording-summary-gist.util';
import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { type CallRecordingMeetingCardInput } from 'src/logic-functions/types/call-recording-meeting-card-input.type';
import { type InboxMessage } from 'src/logic-functions/types/inbox-message.type';
import { formatUtcDateTime } from 'src/logic-functions/utils/format-utc-date-time.util';

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

export const buildCallRecordingRecapMessages = ({
  callRecordingId,
  workspaceMemberId,
  calendarEvent,
  summaryMarkdown,
}: {
  callRecordingId: string;
  workspaceMemberId: string;
  calendarEvent: Pick<
    CalendarEventRecord,
    'id' | 'title' | 'startsAt' | 'endsAt'
  >;
  summaryMarkdown: string;
}): InboxMessage[] => {
  const threadKey = `call-recording-recap-${callRecordingId}-${workspaceMemberId}`;
  const title = calendarEvent.title ?? 'Call recap';
  const meetingCardInput: CallRecordingMeetingCardInput = {
    callRecordingId,
    calendarEventId: calendarEvent.id,
    startsAt: calendarEvent.startsAt,
    endsAt: calendarEvent.endsAt,
  };
  const formattedStartDateTime = formatUtcDateTime(calendarEvent.startsAt);

  const meetingCardMessage: InboxMessage = {
    threadKey,
    idempotencyKey: `call-recording-meeting-card-${callRecordingId}-${workspaceMemberId}`,
    title,
    text: isDefined(formattedStartDateTime)
      ? `Your call on ${formattedStartDateTime} was recorded.`
      : 'Your call was recorded.',
    toolCall: {
      logicFunctionUniversalIdentifier:
        SHOW_CALL_RECORDING_MEETING_CARD_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      input: meetingCardInput,
      output: meetingCardInput,
    },
  };

  const gist = extractCallRecordingSummaryGist(summaryMarkdown);
  const actionItems = extractCallRecordingSummaryActionItems(summaryMarkdown);

  if (!isDefined(gist) && !isDefined(actionItems)) {
    return [meetingCardMessage];
  }

  return [
    meetingCardMessage,
    {
      threadKey,
      idempotencyKey: threadKey,
      title,
      text: [
        gist,
        isDefined(actionItems)
          ? `**Action items**\n\n${actionItems}`
          : undefined,
      ]
        .filter(isDefined)
        .join('\n\n'),
      ...(isDefined(actionItems) ? { toolCall: FOLLOW_UP_QUESTION } : {}),
    },
  ];
};
