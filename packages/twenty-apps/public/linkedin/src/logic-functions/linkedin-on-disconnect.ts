import { defineLogicFunction } from 'twenty-sdk/define';
import { getConnection } from 'twenty-sdk/logic-function';

import { LINKEDIN_ON_DISCONNECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type LinkedinConnectionHookPayload } from 'src/logic-functions/types/linkedin-connection-hook-payload.type';
import { removeLinkedinConnectionResources } from 'src/logic-functions/utils/remove-linkedin-connection-resources.util';

const findUnipileAccountId = async (
  connectedAccountId: string,
): Promise<string | null> => {
  try {
    return (await getConnection(connectedAccountId)).externalAccountId;
  } catch (error) {
    console.warn(
      `[linkedin] connection ${connectedAccountId} is already gone, only its channel is removed: ${error instanceof Error ? error.message : String(error)}`,
    );

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
