import { isNonEmptyString } from '@sniptt/guards';
import {
  deleteMessageChannel,
  kv,
  listMessageChannels,
} from 'twenty-sdk/logic-function';

import { getLinkedinUnipileAccountKey } from 'src/logic-functions/utils/get-linkedin-unipile-account-key.util';
import { deleteUnipileAccount } from 'src/unipile/utils/delete-unipile-account.util';
import { getUnipileAccountClaimKey } from 'src/unipile/utils/get-unipile-account-claim-key.util';

export const removeLinkedinConnectionResources = async ({
  connectedAccountId,
  unipileAccountId,
}: {
  connectedAccountId: string;
  unipileAccountId: string | null;
}): Promise<void> => {
  const channels = await listMessageChannels({ connectedAccountId });

  await Promise.all(channels.map((channel) => deleteMessageChannel(channel.id)));

  if (isNonEmptyString(unipileAccountId)) {
    await deleteUnipileAccount(unipileAccountId);
    await kv.delete(getUnipileAccountClaimKey(unipileAccountId), {
      scope: 'SERVER',
    });
  }

  await kv.delete(getLinkedinUnipileAccountKey(connectedAccountId));
};
