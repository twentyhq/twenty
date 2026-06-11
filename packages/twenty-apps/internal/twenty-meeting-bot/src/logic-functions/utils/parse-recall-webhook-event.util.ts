import { isUndefined } from '@sniptt/guards';

import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { getRecordAtPath } from 'src/logic-functions/utils/get-record-at-path.util';
import { getString } from 'src/logic-functions/utils/get-string.util';
import { normalizeRecallTimestamp } from 'src/logic-functions/utils/normalize-recall-timestamp.util';

export type RecallWebhookBody = {
  event?: unknown;
  type?: unknown;
  data?: unknown;
  bot?: unknown;
};

export type RecallWebhookEvent = {
  event: string;
  statusCode: string | undefined;
  statusTimestamp: string | undefined;
  externalBotId: string | undefined;
  externalRecordingId: string | undefined;
  callRecordingIdFromMetadata: string | undefined;
  recordingStartedAt: string | undefined;
  recordingEndedAt: string | undefined;
  transcriptId: string | undefined;
  transcriptFailureSubCode: string | undefined;
};

// The only reader of raw webhook payloads; Recall delivers several body shapes per event family.
export const parseRecallWebhookEvent = (
  body: RecallWebhookBody,
): RecallWebhookEvent | undefined => {
  const event = getString(body.event) ?? getString(body.type);

  if (isUndefined(event)) {
    return undefined;
  }

  const data = asRecord(body.data);
  const bot = asRecord(body.bot);

  return {
    event,
    statusCode:
      getString(getRecordAtPath(data, ['status', 'code'])) ??
      getString(getRecordAtPath(data, ['data', 'code'])) ??
      getString(getRecordAtPath(bot, ['status', 'code'])) ??
      getStatusCodeFromEventName(event),
    statusTimestamp: normalizeRecallTimestamp(
      getString(getRecordAtPath(data, ['status', 'created_at'])) ??
        getString(getRecordAtPath(data, ['data', 'updated_at'])) ??
        getString(getRecordAtPath(bot, ['status', 'created_at'])),
    ),
    externalBotId:
      getString(data?.bot_id) ??
      getString(getRecordAtPath(data, ['bot', 'id'])) ??
      getString(getRecordAtPath(data, ['recording', 'bot_id'])) ??
      getString(getRecordAtPath(data, ['recording', 'bot', 'id'])) ??
      getString(bot?.id),
    externalRecordingId:
      getString(getRecordAtPath(data, ['status', 'recording_id'])) ??
      getString(getRecordAtPath(data, ['recording', 'id'])) ??
      getString(data?.recording_id),
    callRecordingIdFromMetadata: extractCallRecordingIdFromMetadata({
      data,
      bot,
    }),
    recordingStartedAt: normalizeRecallTimestamp(
      getString(getRecordAtPath(data, ['recording', 'started_at'])),
    ),
    recordingEndedAt: normalizeRecallTimestamp(
      getString(getRecordAtPath(data, ['recording', 'completed_at'])),
    ),
    transcriptId: getString(getRecordAtPath(data, ['transcript', 'id'])),
    transcriptFailureSubCode: getString(
      getRecordAtPath(data, ['status', 'sub_code']),
    ),
  };
};

const getStatusCodeFromEventName = (event: string): string | undefined => {
  if (!event.startsWith('bot.')) {
    return undefined;
  }

  const statusCode = event.slice('bot.'.length);

  return statusCode === 'status_change' ? undefined : statusCode;
};

const extractCallRecordingIdFromMetadata = ({
  data,
  bot,
}: {
  data: Record<string, unknown> | undefined;
  bot: Record<string, unknown> | undefined;
}): string | undefined => {
  const metadata =
    asRecord(bot?.metadata) ??
    asRecord(getRecordAtPath(data, ['bot', 'metadata'])) ??
    asRecord(getRecordAtPath(data, ['recording', 'metadata'])) ??
    asRecord(data?.metadata);

  return getString(metadata?.twentyCallRecordingId);
};
