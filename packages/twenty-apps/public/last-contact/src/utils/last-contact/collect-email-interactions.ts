import { type CoreApiClient } from 'twenty-client-sdk/core';

import { executeWithRetry } from 'src/utils/execute-with-retry';
import { PAGE_SIZE } from 'src/utils/last-contact/page-size';
import { type EmailInteraction } from 'src/utils/last-contact/types';

export const collectEmailInteractions = async (
  client: CoreApiClient,
  personIds?: string[],
): Promise<EmailInteraction[]> => {
  if (personIds && personIds.length === 0) {
    return [];
  }

  const personFilter = personIds
    ? { personId: { in: personIds } }
    : { personId: { is: 'NOT_NULL' } };
  const interactions: EmailInteraction[] = [];
  let after: string | undefined;

  do {
    const { messageParticipants } = await executeWithRetry(() =>
      client.query({
        messageParticipants: {
          __args: {
            filter: personFilter,
            first: PAGE_SIZE,
            after,
          },
          edges: {
            node: {
              id: true,
              personId: true,
              message: { id: true, receivedAt: true },
            },
          },
          pageInfo: { hasNextPage: true, endCursor: true },
        },
      }),
    );

    for (const edge of messageParticipants?.edges ?? []) {
      const { personId, message } = edge.node;
      if (personId && message?.id && message?.receivedAt) {
        interactions.push({
          personId,
          messageId: message.id,
          receivedAt: message.receivedAt,
        });
      }
    }

    after = messageParticipants?.pageInfo.hasNextPage
      ? (messageParticipants.pageInfo.endCursor ?? undefined)
      : undefined;
  } while (after);

  return interactions;
};
