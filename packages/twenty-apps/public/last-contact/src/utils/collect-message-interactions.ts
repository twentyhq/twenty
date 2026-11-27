import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { chunk } from 'src/utils/chunk';
import { executeWithRetry } from 'src/utils/execute-with-retry';
import {
  pickContactTeamMemberId,
  type Participant,
} from 'src/utils/pick-contact-team-member';
import {
  type InteractionDirection,
  type MessageInteractionKind,
} from 'src/utils/update-person-last-contact';

const PAGE_SIZE = 200;

// Messages ingested by an app channel (LinkedIn, WhatsApp...) get this headerMessageId prefix server-side
const APP_MESSAGE_HEADER_MESSAGE_ID_PREFIX = 'app:';

export type MessageInteraction = {
  kind: MessageInteractionKind;
  receivedAt: string;
  workspaceMemberId: string | null;
  direction: InteractionDirection;
};

export type MessageNode = {
  receivedAt?: string | null;
  isDraft?: boolean | null;
  headerMessageId?: string | null;
  messageChannelMessageAssociations?: {
    edges: {
      node: { direction?: string | null; accountOwnerId?: string | null };
    }[];
  } | null;
};

export type MessageParticipantNode = Participant & {
  messageId?: string | null;
  message?: MessageNode | null;
};

export const MESSAGE_SELECTION = {
  receivedAt: true,
  isDraft: true,
  headerMessageId: true,
  messageChannelMessageAssociations: {
    edges: { node: { direction: true, accountOwnerId: true } },
  },
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
                  {
                    or: [
                      { role: { eq: 'FROM' } },
                      { workspaceMemberId: { is: 'NOT_NULL' } },
                    ],
                  },
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
                message: MESSAGE_SELECTION,
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

const collectMessagesById = async (
  client: CoreApiClient,
  messageIds: string[],
): Promise<Map<string, MessageNode>> => {
  const messageById = new Map<string, MessageNode>();

  for (const ids of chunk(messageIds, PAGE_SIZE)) {
    const { messages } = await executeWithRetry(() =>
      client.query({
        messages: {
          __args: { filter: { id: { in: ids } }, first: PAGE_SIZE },
          edges: { node: { id: true, ...MESSAGE_SELECTION } },
        },
      }),
    );

    for (const edge of messages?.edges ?? []) {
      const { id, ...message } = edge.node as MessageNode & {
        id?: string | null;
      };

      if (id) {
        messageById.set(id, message);
      }
    }
  }

  return messageById;
};

// Participants of app channels are not matched to team members, so the
// channel association supplies the direction and owner they cannot.
export const buildMessageInteraction = (
  message: MessageNode | null | undefined,
  participants: MessageParticipantNode[],
): MessageInteraction | undefined => {
  const receivedAt = message?.receivedAt;

  if (!isDefined(receivedAt) || message?.isDraft) {
    return undefined;
  }

  const associations = (
    message?.messageChannelMessageAssociations?.edges ?? []
  ).map((edge) => edge.node);
  const outgoingAssociation = associations.find(
    (association) => association.direction === 'OUTGOING',
  );
  const fromParticipant = participants.find(
    (participant) => participant.role === 'FROM',
  );
  const isOutbound =
    isDefined(fromParticipant?.workspaceMemberId) ||
    isDefined(outgoingAssociation);

  return {
    kind: message?.headerMessageId?.startsWith(
      APP_MESSAGE_HEADER_MESSAGE_ID_PREFIX,
    )
      ? 'message'
      : 'email',
    receivedAt,
    workspaceMemberId:
      pickContactTeamMemberId(participants, { role: 'FROM' }) ??
      (outgoingAssociation ?? associations[0])?.accountOwnerId ??
      null,
    direction: isOutbound ? 'outbound' : 'inbound',
  };
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
    const interaction = buildMessageInteraction(
      participants[0]?.message,
      participants,
    );

    if (interaction) {
      interactionByMessageId.set(messageId, interaction);
    }
  }

  const messageIdsWithoutSenderOrTeamMember = messageIds.filter(
    (messageId) => !participantsByMessageId.has(messageId),
  );

  if (messageIdsWithoutSenderOrTeamMember.length === 0) {
    return interactionByMessageId;
  }

  const messageById = await collectMessagesById(
    client,
    messageIdsWithoutSenderOrTeamMember,
  );

  for (const [messageId, message] of messageById) {
    const interaction = buildMessageInteraction(message, []);

    if (interaction) {
      interactionByMessageId.set(messageId, interaction);
    }
  }

  return interactionByMessageId;
};
