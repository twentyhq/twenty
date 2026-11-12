import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { type TeamsAssistantEmptyRequest } from 'src/features/chat/logic-functions/types/teams-assistant-empty-request.type';
import { buildTeamsEmptyRequestReplyKvKey } from 'src/features/chat/logic-functions/utils/build-teams-empty-request-reply-kv-key';

const CLAIM_TTL_MS = 60 * 60 * 1000;

export const claimTeamsEmptyRequestReply = async (
  emptyRequest: TeamsAssistantEmptyRequest,
): Promise<boolean> => {
  const key = buildTeamsEmptyRequestReplyKvKey(emptyRequest);
  const existingClaim = await kv.get<{ expiresAt: number }>(key);

  if (isDefined(existingClaim) && existingClaim.expiresAt > Date.now()) {
    return false;
  }

  await kv.set(key, { expiresAt: Date.now() + CLAIM_TTL_MS });

  return true;
};
