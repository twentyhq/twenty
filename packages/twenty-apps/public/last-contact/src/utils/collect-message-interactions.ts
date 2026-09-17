import { type CoreApiClient } from 'twenty-client-sdk/core';

import { chunk } from 'src/utils/chunk';
import { executeWithRetry } from 'src/utils/execute-with-retry';
import {
  pickContactTeamMemberId,
  type Participant,
} from 'src/utils/pick-contact-team-member';
import { type InteractionDirection } from 'src/utils/update-person-last-contact';

const PAGE_SIZE = 200;

export type MessageInteraction = {
  receivedAt: string;
  workspaceMemberId: string | null;
  direction: InteractionDirection;
};

type MessageParticipantNode = Participant & {
  messageId?: string | null;
  message?: { receivedAt: string | null } | null;
};

export const collectMessageInteractions = async (
  client: CoreApiClient,
  messageIds: string[],
): Promise<Map<string, MessageInteraction>> => {
  const participantsByMessageId = new Map<string, MessageParticipantNode[]>();

  for (const ids of chunk(messageIds, PAGE_SIZE)) {
    let after: string | undefined;

    do {
      const { messageParticipants } = await executeWithRetry(() =>
        client.query({
          messageParticipants: {
            __args: {
              filter: { messageId: { in: ids } },
              first: PAGE_SIZE,
              after,
            },
            edges: {
              node: {
                messageId: true,
                role: true,
                workspaceMemberId: true,
                message: { receivedAt: true },
              },
            },
            pageInfo: { hasNextPage: true, endCursor: true },
          },
        }),
      );

      for (const edge of messageParticipants?.edges ?? []) {
        const node = edge.node as MessageParticipantNode;

        if (!node.messageId) {
          continue;
        }

        const participants = participantsByMessageId.get(node.messageId);

        if (participants) {
          participants.push(node);
        } else {
          participantsByMessageId.set(node.messageId, [node]);
        }
      }

      after = messageParticipants?.pageInfo.hasNextPage
        ? (messageParticipants.pageInfo.endCursor ?? undefined)
        : undefined;
    } while (after);
  }

  const interactionByMessageId = new Map<string, MessageInteraction>();

  for (const [messageId, participants] of participantsByMessageId) {
    const receivedAt = participants[0]?.message?.receivedAt ?? null;

    if (!receivedAt) {
      continue;
    }

    const fromParticipant = participants.find(
      (participant) => participant.role === 'FROM',
    );

    interactionByMessageId.set(messageId, {
      receivedAt,
      workspaceMemberId: pickContactTeamMemberId(participants, {
        role: 'FROM',
      }),
      direction: fromParticipant?.workspaceMemberId ? 'outbound' : 'inbound',
    });
  }

  return interactionByMessageId;
};
