import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINE_KV_KEY_PREFIXES } from 'src/constants/line-kv-key-prefixes.constant';

const buildBotKey = (botUserId: string) =>
  `${LINE_KV_KEY_PREFIXES.connectedAccountIdByBotUserId}${botUserId}`;

const buildConnectionKey = (connectedAccountId: string) =>
  `${LINE_KV_KEY_PREFIXES.botUserIdByConnectedAccountId}${connectedAccountId}`;

export const findConnectedAccountIdByBotUserId = async (
  botUserId: string,
): Promise<string | undefined> =>
  (await kv.get<string>(buildBotKey(botUserId))) ?? undefined;

export const unlinkBotFromConnection = async (connectedAccountId: string) => {
  const botUserId = await kv.get<string>(buildConnectionKey(connectedAccountId));

  // a later connection may have claimed the bot since
  if (
    isDefined(botUserId) &&
    (await findConnectedAccountIdByBotUserId(botUserId)) === connectedAccountId
  ) {
    await kv.delete(buildBotKey(botUserId));
  }

  await kv.delete(buildConnectionKey(connectedAccountId));
};

export const linkBotToConnection = async ({
  connectedAccountId,
  botUserId,
}: {
  connectedAccountId: string;
  botUserId: string;
}) => {
  await unlinkBotFromConnection(connectedAccountId);
  await kv.set(buildBotKey(botUserId), connectedAccountId);
  await kv.set(buildConnectionKey(connectedAccountId), botUserId);
};
