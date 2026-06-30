import { getRecallWebhookBotMetadata } from 'src/logic-functions/recall-api/get-recall-webhook-bot-metadata.util';
import { type RecallWebhookBody } from 'src/logic-functions/recall-api/parse-recall-webhook-event.util';
import { getString } from 'src/logic-functions/utils/get-string.util';

export const extractTwentyWorkspaceIdFromRecallWebhook = (
  body: RecallWebhookBody,
): string | undefined =>
  getString(getRecallWebhookBotMetadata(body)?.twentyWorkspaceId);
