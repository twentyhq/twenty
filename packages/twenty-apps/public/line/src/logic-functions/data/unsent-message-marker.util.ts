import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINE_KV_KEY_PREFIXES } from 'src/constants/line-kv-key-prefixes.constant';

const buildKey = (messageChannelId: string, messageId: string) =>
  `${LINE_KV_KEY_PREFIXES.unsentMessage}${messageChannelId}:${messageId}`;

export const markMessageUnsent = (messageChannelId: string, messageId: string) =>
  kv.set(buildKey(messageChannelId, messageId), true);

export const isMessageUnsent = async (
  messageChannelId: string,
  messageId: string,
) => isDefined(await kv.get<boolean>(buildKey(messageChannelId, messageId)));

export const forgetUnsentMessage = (
  messageChannelId: string,
  messageId: string,
) => kv.delete(buildKey(messageChannelId, messageId));
