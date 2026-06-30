import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type FirefliesTranscript } from 'src/logic-functions/types/fireflies-transcript.type';
import { fetchFirefliesSummary } from 'src/logic-functions/utils/fetch-fireflies-summary';
import { fetchFirefliesTranscript } from 'src/logic-functions/utils/fetch-fireflies-transcript';
import { type FirefliesApiResult } from 'src/logic-functions/utils/fireflies-api-request';
import { findMatchingCalendarEvent } from 'src/logic-functions/utils/find-matching-calendar-event';
import { formatSummaryAsMarkdown } from 'src/logic-functions/utils/format-summary-as-markdown';
import { formatTranscriptAsMarkdown } from 'src/logic-functions/utils/format-transcript-as-markdown';
import { updateCalendarEventSummary } from 'src/logic-functions/utils/update-calendar-event-summary';
import { updateCalendarEventTranscript } from 'src/logic-functions/utils/update-calendar-event-transcript';

export type FirefliesSyncableField = 'transcript' | 'summary';

export type SyncFirefliesFieldResult =
  | {
      status: 'updated';
      field: FirefliesSyncableField;
      calendarEventId: string;
    }
  | { status: 'skipped'; field: FirefliesSyncableField; reason: string }
  | { status: 'error'; field: FirefliesSyncableField; error: string };

type FieldSyncStrategy = {
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

const FIELD_SYNC_STRATEGIES: Record<FirefliesSyncableField, FieldSyncStrategy> =
  {
    transcript: {
      fetch: fetchFirefliesTranscript,
      format: formatTranscriptAsMarkdown,
      update: updateCalendarEventTranscript,
    },
    summary: {
      fetch: fetchFirefliesSummary,
      format: formatSummaryAsMarkdown,
      update: updateCalendarEventSummary,
    },
  };

export const syncFirefliesFieldToCalendarEvent = async ({
  apiKey,
  client,
  transcriptId,
  field,
}: {
  apiKey: string;
  client: CoreApiClient;
  transcriptId: string;
  field: FirefliesSyncableField;
}): Promise<SyncFirefliesFieldResult> => {
  const strategy = FIELD_SYNC_STRATEGIES[field];

  const fetchResult = await strategy.fetch({ apiKey, transcriptId });

  if (!fetchResult.ok) {
    return { status: 'error', field, error: fetchResult.errorMessage };
  }

  const match = await findMatchingCalendarEvent({
    client,
    transcript: fetchResult.data,
  });

  if (!match.matched) {
    return { status: 'skipped', field, reason: match.reason };
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
      status: 'error',
      field,
      error: `Failed to update CalendarEvent ${match.calendarEventId} ${field}: ${
        (error as Error).message
      }`,
    };
  }

  return {
    status: 'updated',
    field,
    calendarEventId: match.calendarEventId,
  };
};
