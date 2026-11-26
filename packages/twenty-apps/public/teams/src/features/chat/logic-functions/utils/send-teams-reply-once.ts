import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { type TeamsSuggestedActions } from 'src/features/chat/logic-functions/types/teams-suggested-actions.type';
import { buildTeamsMessageActivity } from 'src/features/chat/logic-functions/utils/build-teams-message-activity';
import { getTeamsConnectorAccessTokenOrThrow } from 'src/features/chat/logic-functions/utils/get-teams-connector-access-token-or-throw';
import { sendTeamsActivity } from 'src/features/chat/logic-functions/utils/send-teams-activity';

export const sendTeamsReplyOnce = async ({
  kvKey,
  ttlMs,
  serviceUrl,
  conversationId,
  text,
  suggestedActions,
}: {
  kvKey: string;
  ttlMs: number;
  serviceUrl: string;
  conversationId: string;
  text: string;
  suggestedActions?: TeamsSuggestedActions;
}): Promise<boolean> => {
  const existingClaim = await kv.get<{ expiresAt: number }>(kvKey);

  if (isDefined(existingClaim) && existingClaim.expiresAt > Date.now()) {
    return false;
  }

  await kv.set(kvKey, { expiresAt: Date.now() + ttlMs });

  try {
    await sendTeamsActivity({
      serviceUrl,
      conversationId,
      accessToken: await getTeamsConnectorAccessTokenOrThrow(),
      activity: buildTeamsMessageActivity({ text, suggestedActions }),
    });
  } catch (error) {
    await kv
      .delete(kvKey)
      .catch((releaseError: unknown) =>
        console.warn(
          `[teams] could not release the reply claim ${kvKey}`,
          releaseError,
        ),
      );

    throw error;
  }

  return true;
};
