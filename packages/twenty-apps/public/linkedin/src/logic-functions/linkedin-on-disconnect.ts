import { defineLogicFunction } from 'twenty-sdk/define';
import { getConnection, kv } from 'twenty-sdk/logic-function';

import { LINKEDIN_ON_DISCONNECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type LinkedinConnectionHookPayload } from 'src/logic-functions/types/linkedin-connection-hook-payload.type';
import { getLinkedinUnipileAccountKey } from 'src/logic-functions/utils/get-linkedin-unipile-account-key.util';
import { removeLinkedinConnectionResources } from 'src/logic-functions/utils/remove-linkedin-connection-resources.util';

const findUnipileAccountId = async (
  connectedAccountId: string,
): Promise<string | null> => {
  const cachedUnipileAccountId = await kv.get<string>(
    getLinkedinUnipileAccountKey(connectedAccountId),
  );

  if (cachedUnipileAccountId !== null) {
    return cachedUnipileAccountId;
  }

  try {
    return (await getConnection(connectedAccountId)).externalAccountId;
  } catch {
    return null;
  }
};

export const linkedinOnDisconnectHandler = async ({
  connectedAccountId,
}: LinkedinConnectionHookPayload): Promise<{ success: true }> => {
  await removeLinkedinConnectionResources({
    connectedAccountId,
    unipileAccountId: await findUnipileAccountId(connectedAccountId),
  });

  return { success: true };
};

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_ON_DISCONNECT_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-on-disconnect',
  description:
    'Deletes the message channel and the Unipile account of a removed LinkedIn connection.',
  timeoutSeconds: 30,
  handler: linkedinOnDisconnectHandler,
});
