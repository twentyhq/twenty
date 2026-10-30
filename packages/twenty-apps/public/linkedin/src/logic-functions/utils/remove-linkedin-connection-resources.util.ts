import { isNonEmptyString } from '@sniptt/guards';
import {
  deleteMessageChannel,
  kv,
  listMessageChannels,
} from 'twenty-sdk/logic-function';

import { getLinkedinConnectionKvKey } from 'src/logic-functions/utils/get-linkedin-connection-kv-key.util';
import { deleteUnipileAccountOrThrow } from 'src/unipile/utils/delete-unipile-account-or-throw.util';
import { getUnipileAccountClaimKey } from 'src/unipile/utils/get-unipile-account-claim-key.util';

export const removeLinkedinConnectionResources = async ({
  connectedAccountId,
  unipileAccountId,
}: {
  connectedAccountId: string;
  unipileAccountId: string | null;
}): Promise<void> => {
  const channels = await listMessageChannels({ connectedAccountId });

  await Promise.all(
    channels.map((channel) => deleteMessageChannel(channel.id)),
  );

  await Promise.all(
    (['settings', 'history-import'] as const).map((kind) =>
      kv.delete(getLinkedinConnectionKvKey({ kind, connectedAccountId })),
    ),
  );

  if (isNonEmptyString(unipileAccountId)) {
    await deleteUnipileAccountOrThrow(unipileAccountId);
    await kv.delete(getUnipileAccountClaimKey(unipileAccountId), {
      scope: 'SERVER',
    });
  }
};
