import { type RecallWebhookBody } from 'src/logic-functions/recall-api/parse-recall-webhook-event.util';
import { asRecord } from '@twentyhq/recall-utils/utils/as-record.util';
import { getRecordAtPath } from '@twentyhq/recall-utils/utils/get-record-at-path.util';

// Recall delivers bot metadata under several body shapes per event family; this is the single reader of all of them.
export const getRecallWebhookBotMetadata = (
  body: RecallWebhookBody,
): Record<string, unknown> | undefined => {
  const data = asRecord(body.data);
  const bot = asRecord(body.bot);

  return (
    asRecord(bot?.metadata) ??
    asRecord(getRecordAtPath(data, ['bot', 'metadata'])) ??
    asRecord(getRecordAtPath(data, ['sdk_upload', 'metadata'])) ??
    asRecord(getRecordAtPath(data, ['recording', 'metadata'])) ??
    asRecord(data?.metadata)
  );
};
