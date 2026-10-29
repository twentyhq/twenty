import { defineLogicFunction } from 'twenty-sdk/define';
import { kv } from 'twenty-sdk/logic-function';

import { LINKEDIN_ON_DISCONNECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type LinkedinConnectionHookPayload } from 'src/logic-functions/types/linkedin-connection-hook-payload.type';
import { getLinkedinUnipileAccountKey } from 'src/logic-functions/utils/get-linkedin-unipile-account-key.util';
import { removeLinkedinConnectionResources } from 'src/logic-functions/utils/remove-linkedin-connection-resources.util';

export const linkedinOnDisconnectHandler = async ({
  connectedAccountId,
}: LinkedinConnectionHookPayload): Promise<{ success: true }> => {
  await removeLinkedinConnectionResources({
    connectedAccountId,
    unipileAccountId: await kv.get<string>(
      getLinkedinUnipileAccountKey(connectedAccountId),
    ),
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
