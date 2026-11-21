import { kv } from 'twenty-sdk/logic-function';

import { MESSENGER_KV_KEY_PREFIXES } from 'src/constants/messenger-kv-key-prefixes.constant';

const buildBackfillKey = (pageId: string) =>
  `${MESSENGER_KV_KEY_PREFIXES.backfillCompletedByPageId}${pageId}`;

export const isBackfillCompleted = async (pageId: string) =>
  (await kv.get<boolean>(buildBackfillKey(pageId))) === true;

export const markBackfillCompleted = (pageId: string) =>
  kv.set(buildBackfillKey(pageId), true);

export const forgetBackfillCompletion = async (pageId: string) => {
  await kv.delete(buildBackfillKey(pageId));
  await kv.delete(buildBackfillRunKey(pageId));
};

const buildBackfillRunKey = (pageId: string) =>
  `${MESSENGER_KV_KEY_PREFIXES.backfillRunIdByPageId}${pageId}`;

// a reconnect starts a new run; jobs of an older run stop instead of doubling the calls to Meta
export const startBackfillRun = async (pageId: string) => {
  const backfillRunId = String(Date.now());

  await kv.set(buildBackfillRunKey(pageId), backfillRunId);

  return backfillRunId;
};

export const isCurrentBackfillRun = async ({
  pageId,
  backfillRunId,
}: {
  pageId: string;
  backfillRunId: string;
}) => (await kv.get<string>(buildBackfillRunKey(pageId))) === backfillRunId;
