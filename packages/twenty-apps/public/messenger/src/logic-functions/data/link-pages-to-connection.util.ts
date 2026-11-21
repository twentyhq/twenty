import { kv } from 'twenty-sdk/logic-function';

import { MESSENGER_KV_KEY_PREFIXES } from 'src/constants/messenger-kv-key-prefixes.constant';
import {
  buildPageKey,
  findConnectedAccountIdByPageId,
} from 'src/logic-functions/data/find-connected-account-id-by-page-id.util';

const buildConnectionKey = (connectedAccountId: string) =>
  `${MESSENGER_KV_KEY_PREFIXES.pageIdsByConnectedAccountId}${connectedAccountId}`;

export const findPageIdsOfConnection = async (connectedAccountId: string) =>
  (await kv.get<string[]>(buildConnectionKey(connectedAccountId))) ?? [];

const forgetPages = async ({
  connectedAccountId,
  pageIds,
}: {
  connectedAccountId: string;
  pageIds: string[];
}) => {
  await Promise.all(
    pageIds.map(async (pageId) => {
      // another connection may have claimed the Page since
      if (
        (await findConnectedAccountIdByPageId(pageId)) === connectedAccountId
      ) {
        await kv.delete(buildPageKey(pageId));
      }
    }),
  );
};

export const linkPagesToConnection = async ({
  connectedAccountId,
  pageIds,
}: {
  connectedAccountId: string;
  pageIds: string[];
}) => {
  const previousPageIds = await findPageIdsOfConnection(connectedAccountId);

  await Promise.all(
    pageIds.map((pageId) => kv.set(buildPageKey(pageId), connectedAccountId)),
  );

  await forgetPages({
    connectedAccountId,
    pageIds: previousPageIds.filter((pageId) => !pageIds.includes(pageId)),
  });

  await kv.set(buildConnectionKey(connectedAccountId), pageIds);
};

export const unlinkPagesFromConnection = async (connectedAccountId: string) => {
  await forgetPages({
    connectedAccountId,
    pageIds: await findPageIdsOfConnection(connectedAccountId),
  });

  await kv.delete(buildConnectionKey(connectedAccountId));
};
