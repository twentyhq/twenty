import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  deleteMessageChannel,
  kv,
  listMessageChannels,
} from 'twenty-sdk/logic-function';

import { LINKEDIN_ON_DISCONNECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type LinkedinConnectionHookPayload } from 'src/logic-functions/types/linkedin-connection-hook-payload.type';
import { getLinkedinUnipileAccountKey } from 'src/logic-functions/utils/get-linkedin-unipile-account-key.util';
import { deleteUnipileAccount } from 'src/unipile/utils/delete-unipile-account.util';
import { getUnipileAccountClaimKey } from 'src/unipile/utils/get-unipile-account-claim-key.util';

export const linkedinOnDisconnectHandler = async ({
  connectedAccountId,
}: LinkedinConnectionHookPayload): Promise<{ success: true }> => {
  const channels = await listMessageChannels({ connectedAccountId });

  await Promise.all(channels.map((channel) => deleteMessageChannel(channel.id)));

  const unipileAccountKey = getLinkedinUnipileAccountKey(connectedAccountId);
  const unipileAccountId = await kv.get<string>(unipileAccountKey);

  if (isNonEmptyString(unipileAccountId)) {
    await deleteUnipileAccount(unipileAccountId);
    await kv.delete(getUnipileAccountClaimKey(unipileAccountId), {
      scope: 'SERVER',
    });
    await kv.delete(unipileAccountKey);
  }

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
