import { isUndefined } from '@sniptt/guards';
import { getRecallWebhookBotMetadata } from 'src/logic-functions/recall-api/utils/getRecallWebhookBotMetadata';
import { asRecord } from 'src/logic-functions/utils/asRecord';
import { getRecordAtPath } from 'src/logic-functions/utils/getRecordAtPath';
import { getString } from 'src/logic-functions/utils/getString';
import { normalizeRecallTimestamp } from 'src/logic-functions/recall-api/utils/normalizeRecallTimestamp';
import { type RecallWebhookBody } from 'src/logic-functions/types/RecallWebhookBody';
import { type RecallWebhookEvent } from 'src/logic-functions/types/RecallWebhookEvent';

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
    statusSubCode:
      getString(getRecordAtPath(data, ['status', 'sub_code'])) ??
      getString(getRecordAtPath(data, ['data', 'sub_code'])) ??
      getString(getRecordAtPath(bot, ['status', 'sub_code'])),
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
    externalSdkUploadId: getString(getRecordAtPath(data, ['sdk_upload', 'id'])),
    externalRecordingId:
      getString(getRecordAtPath(data, ['status', 'recording_id'])) ??
      getString(getRecordAtPath(data, ['recording', 'id'])) ??
      getString(data?.recording_id),
    callRecordingIdFromMetadata: getString(
      getRecallWebhookBotMetadata(body)?.twentyCallRecordingId,
    ),
    recordingStartedAt: normalizeRecallTimestamp(
      getString(getRecordAtPath(data, ['recording', 'started_at'])),
    ),
    recordingEndedAt: normalizeRecallTimestamp(
      getString(getRecordAtPath(data, ['recording', 'completed_at'])),
    ),
    transcriptId: getString(getRecordAtPath(data, ['transcript', 'id'])),
  };
};

const getStatusCodeFromEventName = (event: string): string | undefined => {
  if (!event.startsWith('bot.')) {
    return undefined;
  }

  const statusCode = event.slice('bot.'.length);

  return statusCode === 'status_change' ? undefined : statusCode;
};
