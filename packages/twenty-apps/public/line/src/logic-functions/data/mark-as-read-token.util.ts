import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINE_KV_KEY_PREFIXES } from 'src/constants/line-kv-key-prefixes.constant';

type StoredMarkAsReadToken = { token: string; timestamp: number };

const buildKey = ({
  botUserId,
  chatId,
}: {
  botUserId: string;
  chatId: string;
}) => `${LINE_KV_KEY_PREFIXES.markAsReadTokenByThread}${botUserId}:${chatId}`;

export const findMarkAsReadToken = async (thread: {
  botUserId: string;
  chatId: string;
}): Promise<StoredMarkAsReadToken | undefined> =>
  (await kv.get<StoredMarkAsReadToken>(buildKey(thread))) ?? undefined;

// events can be processed out of order, and a token marks every message up to its own as read
export const storeMarkAsReadToken = async ({
  botUserId,
  chatId,
  token,
  timestamp,
}: {
  botUserId: string;
  chatId: string;
  token: string;
  timestamp: number;
}) => {
  const storedToken = await findMarkAsReadToken({ botUserId, chatId });

  if (isDefined(storedToken) && storedToken.timestamp > timestamp) {
    return;
  }

  await kv.set(buildKey({ botUserId, chatId }), { token, timestamp });
};

export const forgetMarkAsReadToken = async ({
  botUserId,
  chatId,
  token,
}: {
  botUserId: string;
  chatId: string;
  token: string;
}) => {
  // a newer message may have stored its own token since
  if ((await findMarkAsReadToken({ botUserId, chatId }))?.token === token) {
    await kv.delete(buildKey({ botUserId, chatId }));
  }
};
