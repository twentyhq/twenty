import { kv } from 'twenty-sdk/logic-function';

import { MESSENGER_KV_KEY_PREFIXES } from 'src/constants/messenger-kv-key-prefixes.constant';

export const buildPageKey = (pageId: string) =>
  `${MESSENGER_KV_KEY_PREFIXES.connectedAccountIdByPageId}${pageId}`;

export const findConnectedAccountIdByPageId = async (
  pageId: string,
): Promise<string | undefined> =>
  (await kv.get<string>(buildPageKey(pageId))) ?? undefined;
