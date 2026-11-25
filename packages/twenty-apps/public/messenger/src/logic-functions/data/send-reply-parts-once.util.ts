import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { MESSENGER_KV_KEY_PREFIXES } from 'src/constants/messenger-kv-key-prefixes.constant';

// Messenger sends text and each attachment separately, so a retry after a partial failure resumes where it stopped
export const sendReplyPartsOnce = async ({
  idempotencyKey,
  sendParts,
}: {
  idempotencyKey: string | undefined;
  sendParts: (() => Promise<string>)[];
}): Promise<string[]> => {
  const progressKey = isDefined(idempotencyKey)
    ? `${MESSENGER_KV_KEY_PREFIXES.sentReplyPartIdsByIdempotencyKey}${idempotencyKey}`
    : undefined;
  const sentPartIds = isDefined(progressKey)
    ? ((await kv.get<string[]>(progressKey)) ?? [])
    : [];

  for (const sendPart of sendParts.slice(sentPartIds.length)) {
    sentPartIds.push(await sendPart());

    if (isDefined(progressKey)) {
      await kv.set(progressKey, sentPartIds);
    }
  }

  if (isDefined(progressKey)) {
    await kv.delete(progressKey);
  }

  return sentPartIds;
};
