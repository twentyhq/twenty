import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINE_KV_KEY_PREFIXES } from 'src/constants/line-kv-key-prefixes.constant';

type StoredMarkAsReadToken = { token: string; timestamp: number };

const buildKey = ({
  botUserId,
  userId,
}: {
  botUserId: string;
  userId: string;
}) => `${LINE_KV_KEY_PREFIXES.markAsReadTokenByThread}${botUserId}:${userId}`;

export const findMarkAsReadToken = async (thread: {
  botUserId: string;
  userId: string;
}): Promise<StoredMarkAsReadToken | undefined> =>
  (await kv.get<StoredMarkAsReadToken>(buildKey(thread))) ?? undefined;

// events can be processed out of order, and a token marks every message up to its own as read
export const storeMarkAsReadToken = async ({
  botUserId,
  userId,
  token,
  timestamp,
}: {
  botUserId: string;
  userId: string;
  token: string;
  timestamp: number;
}) => {
  const storedToken = await findMarkAsReadToken({ botUserId, userId });

  if (isDefined(storedToken) && storedToken.timestamp > timestamp) {
    return;
  }

  await kv.set(buildKey({ botUserId, userId }), { token, timestamp });
};

export const forgetMarkAsReadToken = async ({
  botUserId,
  userId,
  token,
}: {
  botUserId: string;
  userId: string;
  token: string;
}) => {
  // a newer message may have stored its own token since
  if ((await findMarkAsReadToken({ botUserId, userId }))?.token === token) {
    await kv.delete(buildKey({ botUserId, userId }));
  }
};
