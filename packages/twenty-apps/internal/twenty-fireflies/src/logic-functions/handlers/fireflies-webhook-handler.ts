import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-shared/utils';

import { type FirefliesWebhookResult } from 'src/logic-functions/types/fireflies-webhook-payload.type';
import { fetchFirefliesTranscript } from 'src/logic-functions/utils/fetch-fireflies-transcript';
import { findMatchingCalendarEvent } from 'src/logic-functions/utils/find-matching-calendar-event';
import { formatTranscriptAsMarkdown } from 'src/logic-functions/utils/format-transcript-as-markdown';
import { getFirefliesApiKey } from 'src/logic-functions/utils/get-fireflies-api-key';
import { updateCalendarEventTranscript } from 'src/logic-functions/utils/update-calendar-event-transcript';

const TRANSCRIPT_READY_EVENT = 'meeting.transcribed';
const SUMMARY_READY_EVENT = 'meeting.summarized';

export const firefliesWebhookHandler = async ({
  meetingId,
  eventType,
}: {
  meetingId?: string | null;
  eventType?: string | null;
}): Promise<FirefliesWebhookResult> => {
  if (!isDefined(meetingId) || meetingId.length === 0) {
    return { error: 'Webhook payload is missing meetingId' };
  }

  if (eventType === SUMMARY_READY_EVENT) {
    return {
      skipped: true,
      reason: `Event "${SUMMARY_READY_EVENT}" is not consumed in v1; only "${TRANSCRIPT_READY_EVENT}" syncs the transcript`,
      meetingId,
    };
  }

  if (eventType !== TRANSCRIPT_READY_EVENT) {
    return {
      skipped: true,
      reason: `Unknown Fireflies Webhooks V2 event "${
        eventType ?? '<missing>'
      }"; expected "${TRANSCRIPT_READY_EVENT}"`,
      meetingId,
    };
  }

  const apiKeyResult = getFirefliesApiKey();

  if (!apiKeyResult.success) {
    return { error: apiKeyResult.error, meetingId };
  }

  const transcriptResult = await fetchFirefliesTranscript({
    apiKey: apiKeyResult.apiKey,
    transcriptId: meetingId,
  });

  if (!transcriptResult.ok) {
    return { error: transcriptResult.errorMessage, meetingId };
  }

  const client = new CoreApiClient();

  const match = await findMatchingCalendarEvent({
    client,
    transcript: transcriptResult.data,
  });

  if (!match.matched) {
    return { skipped: true, reason: match.reason, meetingId };
  }

  const markdown = formatTranscriptAsMarkdown(transcriptResult.data);

  try {
    await updateCalendarEventTranscript({
      client,
      calendarEventId: match.calendarEventId,
      markdown,
    });
  } catch (error) {
    return {
      error: `Failed to update CalendarEvent ${match.calendarEventId}: ${
        (error as Error).message
      }`,
      meetingId,
    };
  }

  return {
    action: 'updated',
    calendarEventId: match.calendarEventId,
    meetingId,
  };
};
