import { type CoreApiClient } from 'twenty-client-sdk/core';

import { NOT_DRAFT_MESSAGE_FILTER } from 'src/constants/not-draft-message-filter';
import { chunk } from 'src/utils/chunk';
import { executeWithRetry } from 'src/utils/execute-with-retry';
import {
  pickContactTeamMemberId,
  type Participant,
} from 'src/utils/pick-contact-team-member';
import { type InteractionDirection } from 'src/utils/update-person-last-contact';

const PAGE_SIZE = 200;

const SENDER_OR_TEAM_MEMBER_FILTER = {
  or: [
    { role: { eq: 'FROM' } },
    { workspaceMemberId: { is: 'NOT_NULL' } },
  ],
};

export type MessageInteraction = {
  receivedAt: string;
  workspaceMemberId: string | null;
  direction: InteractionDirection;
};

type MessageParticipantNode = Participant & {
  messageId?: string | null;
  message?: { receivedAt: string | null; isDraft?: boolean | null } | null;
};

const collectSenderAndTeamMemberParticipants = async (
  client: CoreApiClient,
  messageIds: string[],
): Promise<Map<string, MessageParticipantNode[]>> => {
  const participantsByMessageId = new Map<string, MessageParticipantNode[]>();

  for (const ids of chunk(messageIds, PAGE_SIZE)) {
    let after: string | undefined;

    do {
      const { messageParticipants } = await executeWithRetry(() =>
        client.query({
          messageParticipants: {
            __args: {
              filter: {
                and: [
                  { messageId: { in: ids } },
                  SENDER_OR_TEAM_MEMBER_FILTER,
                ],
              },
              first: PAGE_SIZE,
              after,
            },
            edges: {
              node: {
                messageId: true,
                role: true,
                workspaceMemberId: true,
                message: { receivedAt: true, isDraft: true },
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

  return participantsByMessageId;
};

const collectReceivedAtByMessageId = async (
  client: CoreApiClient,
  messageIds: string[],
): Promise<Map<string, string>> => {
  const receivedAtByMessageId = new Map<string, string>();

  for (const ids of chunk(messageIds, PAGE_SIZE)) {
    const { messages } = await executeWithRetry(() =>
      client.query({
        messages: {
          __args: {
            filter: { id: { in: ids }, ...NOT_DRAFT_MESSAGE_FILTER },
            first: PAGE_SIZE,
          },
          edges: { node: { id: true, receivedAt: true } },
        },
      }),
    );

    for (const edge of messages?.edges ?? []) {
      const { id, receivedAt } = edge.node;

      if (id && receivedAt) {
        receivedAtByMessageId.set(id, receivedAt);
      }
    }
  }

  return receivedAtByMessageId;
};

export const collectMessageInteractions = async (
  client: CoreApiClient,
  messageIds: string[],
): Promise<Map<string, MessageInteraction>> => {
  const participantsByMessageId = await collectSenderAndTeamMemberParticipants(
    client,
    messageIds,
  );
  const interactionByMessageId = new Map<string, MessageInteraction>();

  for (const [messageId, participants] of participantsByMessageId) {
    const message = participants[0]?.message;
    const receivedAt = message?.receivedAt ?? null;

    if (!receivedAt || message?.isDraft) {
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

  const messageIdsWithoutSenderOrTeamMember = messageIds.filter(
    (messageId) => !participantsByMessageId.has(messageId),
  );

  if (messageIdsWithoutSenderOrTeamMember.length === 0) {
    return interactionByMessageId;
  }

  const receivedAtByMessageId = await collectReceivedAtByMessageId(
    client,
    messageIdsWithoutSenderOrTeamMember,
  );

  for (const [messageId, receivedAt] of receivedAtByMessageId) {
    interactionByMessageId.set(messageId, {
      receivedAt,
      workspaceMemberId: null,
      direction: 'inbound',
    });
  }

  return interactionByMessageId;
};
