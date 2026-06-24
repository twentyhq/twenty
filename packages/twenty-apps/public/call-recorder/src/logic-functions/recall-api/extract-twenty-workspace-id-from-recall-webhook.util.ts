import { type RecallWebhookBody } from 'src/logic-functions/recall-api/parse-recall-webhook-event.util';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { getRecordAtPath } from 'src/logic-functions/utils/get-record-at-path.util';
import { getString } from 'src/logic-functions/utils/get-string.util';

export const extractTwentyWorkspaceIdFromRecallWebhook = (
  body: RecallWebhookBody,
): string | undefined => {
  const data = asRecord(body.data);
  const bot = asRecord(body.bot);
  const metadata =
    asRecord(bot?.metadata) ??
    asRecord(getRecordAtPath(data, ['bot', 'metadata'])) ??
    asRecord(getRecordAtPath(data, ['recording', 'metadata'])) ??
    asRecord(data?.metadata);

  return getString(metadata?.twentyWorkspaceId);
};
