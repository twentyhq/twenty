import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { type FirefliesTranscript } from 'src/logic-functions/types/fireflies-transcript.type';
import {
  type FirefliesSyncedField,
  type FirefliesWebhookResult,
} from 'src/logic-functions/types/fireflies-webhook-payload.type';
import { fetchFirefliesSummary } from 'src/logic-functions/utils/fetch-fireflies-summary';
import { fetchFirefliesTranscript } from 'src/logic-functions/utils/fetch-fireflies-transcript';
import { type FirefliesApiResult } from 'src/logic-functions/utils/fireflies-api-request';
import { findMatchingCalendarEvent } from 'src/logic-functions/utils/find-matching-calendar-event';
import { formatSummaryAsMarkdown } from 'src/logic-functions/utils/format-summary-as-markdown';
import { formatTranscriptAsMarkdown } from 'src/logic-functions/utils/format-transcript-as-markdown';
import { getFirefliesApiKey } from 'src/logic-functions/utils/get-fireflies-api-key';
import { updateCalendarEventSummary } from 'src/logic-functions/utils/update-calendar-event-summary';
import { updateCalendarEventTranscript } from 'src/logic-functions/utils/update-calendar-event-transcript';

const TRANSCRIPT_READY_EVENT = 'meeting.transcribed';
const SUMMARY_READY_EVENT = 'meeting.summarized';

type SyncStrategy = {
  field: FirefliesSyncedField;
  fetch: (args: {
    apiKey: string;
    transcriptId: string;
  }) => Promise<FirefliesApiResult<FirefliesTranscript>>;
  format: (transcript: FirefliesTranscript) => string;
  update: (args: {
    client: CoreApiClient;
    calendarEventId: string;
    markdown: string;
  }) => Promise<void>;
};

const SYNC_STRATEGY_BY_EVENT: Record<string, SyncStrategy> = {
  [TRANSCRIPT_READY_EVENT]: {
    field: 'transcript',
    fetch: fetchFirefliesTranscript,
    format: formatTranscriptAsMarkdown,
    update: updateCalendarEventTranscript,
  },
  [SUMMARY_READY_EVENT]: {
    field: 'summary',
    fetch: fetchFirefliesSummary,
    format: formatSummaryAsMarkdown,
    update: updateCalendarEventSummary,
  },
};

export const firefliesWebhookHandler = async ({
  meetingId,
  eventType,
}: {
  meetingId?: string | null;
  eventType?: string | null;
}): Promise<FirefliesWebhookResult> => {
  if (!isNonEmptyString(meetingId)) {
    return { error: 'Webhook payload is missing meetingId' };
  }

  const strategy = isNonEmptyString(eventType)
    ? SYNC_STRATEGY_BY_EVENT[eventType]
    : undefined;

  if (strategy === undefined) {
    return {
      skipped: true,
      reason: `Unsupported Fireflies Webhooks V2 event "${
        eventType ?? '<missing>'
      }"; expected "${TRANSCRIPT_READY_EVENT}" or "${SUMMARY_READY_EVENT}"`,
      meetingId,
    };
  }

  const apiKeyResult = getFirefliesApiKey();

  if (!apiKeyResult.success) {
    return { error: apiKeyResult.error, meetingId };
  }

  const fetchResult = await strategy.fetch({
    apiKey: apiKeyResult.apiKey,
    transcriptId: meetingId,
  });

  if (!fetchResult.ok) {
    return { error: fetchResult.errorMessage, meetingId };
  }

  const client = new CoreApiClient();

  const match = await findMatchingCalendarEvent({
    client,
    transcript: fetchResult.data,
  });

  if (!match.matched) {
    return { skipped: true, reason: match.reason, meetingId };
  }

  const markdown = strategy.format(fetchResult.data);

  try {
    await strategy.update({
      client,
      calendarEventId: match.calendarEventId,
      markdown,
    });
  } catch (error) {
    return {
      error: `Failed to update CalendarEvent ${match.calendarEventId} ${
        strategy.field
      }: ${(error as Error).message}`,
      meetingId,
    };
  }

  return {
    action: 'updated',
    field: strategy.field,
    calendarEventId: match.calendarEventId,
    meetingId,
  };
};
