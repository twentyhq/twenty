import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from '@utils/is-defined';

import { TWENTY_PAGE_SIZE } from '@modules/resend/constants/sync-config';
import { extractConnection } from '@modules/resend/shared/utils/typed-client';

export type SentBroadcast = {
  id: string;
  sentAtMs: number;
};

type SentBroadcastNode = {
  id: string;
  sentAt?: string | null;
};

export const findRecentSentBroadcasts = async (
  client: CoreApiClient,
  { sinceIso }: { sinceIso: string },
): Promise<SentBroadcast[]> => {
  const broadcasts: SentBroadcast[] = [];

  let hasNextPage = true;
  let afterCursor: string | undefined;

  while (hasNextPage) {
    const queryArgs: Record<string, unknown> = {
      filter: {
        sentAt: { gte: sinceIso },
      },
      first: TWENTY_PAGE_SIZE,
    };

    if (isDefined(afterCursor)) {
      queryArgs.after = afterCursor;
    }

    const queryResult = await client.query({
      resendBroadcasts: {
        __args: queryArgs,
        pageInfo: {
          hasNextPage: true,
          endCursor: true,
        },
        edges: {
          node: {
            id: true,
            sentAt: true,
          },
        },
      },
    });

    const connection = extractConnection<SentBroadcastNode>(
      queryResult,
      'resendBroadcasts',
    );

    for (const edge of connection.edges) {
      const { id, sentAt } = edge.node;

      if (typeof sentAt !== 'string' || sentAt.length === 0) continue;

      const sentAtMs = new Date(sentAt).getTime();

      if (Number.isNaN(sentAtMs)) continue;

      broadcasts.push({ id, sentAtMs });
    }

    hasNextPage = connection.pageInfo?.hasNextPage ?? false;
    afterCursor = connection.pageInfo?.endCursor ?? undefined;

    if (!isDefined(afterCursor)) {
      hasNextPage = false;
    }
  }

  broadcasts.sort((left, right) => left.sentAtMs - right.sentAtMs);

  return broadcasts;
};
