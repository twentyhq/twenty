import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { type FirefliesWebhookResult } from 'src/logic-functions/types/fireflies-webhook-payload.type';
import { getFirefliesApiKey } from 'src/logic-functions/utils/get-fireflies-api-key';
import {
  type FirefliesSyncableField,
  syncFirefliesCallToCallRecording,
} from 'src/logic-functions/utils/sync-fireflies-call-to-call-recording';

const TRANSCRIPT_READY_EVENT = 'meeting.transcribed';
const SUMMARY_READY_EVENT = 'meeting.summarized';

const FIELD_BY_EVENT: Record<string, FirefliesSyncableField> = {
  [TRANSCRIPT_READY_EVENT]: 'transcript',
  [SUMMARY_READY_EVENT]: 'summary',
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

  const field = isNonEmptyString(eventType)
    ? FIELD_BY_EVENT[eventType]
    : undefined;

  if (field === undefined) {
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

  const syncResult = await syncFirefliesCallToCallRecording({
    apiKey: apiKeyResult.apiKey,
    client: new CoreApiClient(),
    transcriptId: meetingId,
    field,
  });

  if (syncResult.status === 'error') {
    return { error: syncResult.error, meetingId };
  }

  if (syncResult.status === 'skipped') {
    return { skipped: true, reason: syncResult.reason, meetingId };
  }

  return {
    action: 'updated',
    field: syncResult.field,
    callRecordingId: syncResult.callRecordingId,
    calendarEventId: syncResult.calendarEventId,
    meetingId,
  };
};
