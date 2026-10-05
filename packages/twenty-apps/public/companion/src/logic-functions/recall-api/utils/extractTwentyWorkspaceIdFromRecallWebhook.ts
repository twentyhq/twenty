import { getRecallWebhookBotMetadata } from 'src/logic-functions/recall-api/utils/getRecallWebhookBotMetadata';
import { type RecallWebhookBody } from 'src/logic-functions/types/RecallWebhookBody';
import { getString } from 'src/logic-functions/utils/getString';

export const extractTwentyWorkspaceIdFromRecallWebhook = (
  body: RecallWebhookBody,
): string | undefined =>
  getString(getRecallWebhookBotMetadata(body)?.twentyWorkspaceId);
