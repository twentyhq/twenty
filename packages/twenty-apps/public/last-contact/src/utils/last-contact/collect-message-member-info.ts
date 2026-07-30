import { type CoreApiClient } from 'twenty-client-sdk/core';

import { executeWithRetry } from 'src/utils/execute-with-retry';
import { chunk } from 'src/utils/last-contact/chunk';
import { PAGE_SIZE } from 'src/utils/last-contact/page-size';
import { type MessageMemberInfo } from 'src/utils/last-contact/types';

export const collectMessageMemberInfo = async (
  client: CoreApiClient,
  messageIds: string[],
): Promise<Map<string, MessageMemberInfo>> => {
  const infoByMessageId = new Map<string, MessageMemberInfo>();

  for (const ids of chunk(messageIds, PAGE_SIZE)) {
    let after: string | undefined;

    do {
      const { messageParticipants } = await executeWithRetry(() =>
        client.query({
          messageParticipants: {
            __args: {
              filter: {
                messageId: { in: ids },
                workspaceMemberId: { is: 'NOT_NULL' },
              },
              first: PAGE_SIZE,
              after,
            },
            edges: {
              node: { messageId: true, role: true, workspaceMemberId: true },
            },
            pageInfo: { hasNextPage: true, endCursor: true },
          },
        }),
      );

      for (const edge of messageParticipants?.edges ?? []) {
        const { messageId, role, workspaceMemberId } = edge.node;
        if (!messageId || !workspaceMemberId) {
          continue;
        }
        const info = infoByMessageId.get(messageId) ?? {
          ownerId: workspaceMemberId,
          fromIsMember: false,
        };
        if (role === 'FROM') {
          info.ownerId = workspaceMemberId;
          info.fromIsMember = true;
        }
        infoByMessageId.set(messageId, info);
      }

      after = messageParticipants?.pageInfo.hasNextPage
        ? (messageParticipants.pageInfo.endCursor ?? undefined)
        : undefined;
    } while (after);
  }

  return infoByMessageId;
};
