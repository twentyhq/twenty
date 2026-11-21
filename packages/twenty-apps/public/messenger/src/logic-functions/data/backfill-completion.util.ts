import { kv } from 'twenty-sdk/logic-function';

import { MESSENGER_KV_KEY_PREFIXES } from 'src/constants/messenger-kv-key-prefixes.constant';

const buildBackfillKey = (pageId: string) =>
  `${MESSENGER_KV_KEY_PREFIXES.backfillCompletedByPageId}${pageId}`;

export const isBackfillCompleted = async (pageId: string) =>
  (await kv.get<boolean>(buildBackfillKey(pageId))) === true;

export const markBackfillCompleted = (pageId: string) =>
  kv.set(buildBackfillKey(pageId), true);

export const forgetBackfillCompletion = (pageId: string) =>
  kv.delete(buildBackfillKey(pageId));
