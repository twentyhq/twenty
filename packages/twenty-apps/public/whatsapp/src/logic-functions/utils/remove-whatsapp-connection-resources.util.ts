import { isNonEmptyString } from '@sniptt/guards';
import {
  deleteMessageChannel,
  kv,
  listMessageChannels,
} from 'twenty-sdk/logic-function';

import { isDefined } from 'twenty-sdk/utils';

import { getWhatsappHistoryImportState } from 'src/logic-functions/utils/get-whatsapp-history-import-state.util';
import { deleteWhatsappHistoryImportData } from 'src/logic-functions/utils/whatsapp-history-import-kv.util';
import { getWhatsappConnectionKvKey } from 'src/logic-functions/utils/get-whatsapp-connection-kv-key.util';
import { deleteUnipileAccountOrThrow } from 'src/unipile/utils/delete-unipile-account-or-throw.util';
import { getUnipileAccountClaimKey } from 'src/unipile/utils/get-unipile-account-claim-key.util';

export const removeWhatsappConnectionResources = async ({
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

  const historyImport = await getWhatsappHistoryImportState(connectedAccountId);

  if (isDefined(historyImport)) {
    await deleteWhatsappHistoryImportData({
      connectedAccountId,
      runId: historyImport.runId,
    });
  }

  await Promise.all(
    (['settings', 'history-import'] as const).map((kind) =>
      kv.delete(getWhatsappConnectionKvKey({ kind, connectedAccountId })),
    ),
  );

  if (isNonEmptyString(unipileAccountId)) {
    await deleteUnipileAccountOrThrow(unipileAccountId);
    await kv.delete(getUnipileAccountClaimKey(unipileAccountId), {
      scope: 'SERVER',
    });
  }
};
