import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';
import { SEND_TEMPLATE_TO_PEOPLE_MAX_RECIPIENTS } from 'src/constants/send-template-to-people-max-recipients.constant';
import { type WhatsAppCampaignRecipient } from 'src/logic-functions/types/whatsapp-campaign-recipient.type';

type CampaignMessageNode = {
  id: string;
  receivedAt: string | null;
  whatsAppStatus: string | null;
  whatsAppStatusError: string | null;
  messageParticipants: {
    edges: Array<{
      node: {
        role: string;
        handle: string | null;
        displayName: string | null;
        personId: string | null;
        person: { name: { firstName: string | null; lastName: string | null } | null } | null;
      };
    }>;
  } | null;
};

const REPLY_ASSOCIATIONS_PAGE_SIZE = 1000;

// a conversation can hold many replies, so pages are read until every thread is found or none are left
const findRepliedThreadExternalIds = async ({
  client,
  threadExternalIds,
  campaignCreatedAt,
}: {
  client: CoreApiClient;
  threadExternalIds: string[];
  campaignCreatedAt: string;
}): Promise<Set<string>> => {
  const repliedThreadExternalIds = new Set<string>();
  let after: string | undefined;

  if (threadExternalIds.length === 0) {
    return repliedThreadExternalIds;
  }

  do {
    const { messageChannelMessageAssociations: page } = await client.query({
      messageChannelMessageAssociations: {
        __args: {
          filter: {
            messageThreadExternalId: { in: threadExternalIds },
            direction: { eq: 'INCOMING' },
            createdAt: { gt: campaignCreatedAt },
          },
          first: REPLY_ASSOCIATIONS_PAGE_SIZE,
          ...(isDefined(after) ? { after } : {}),
        },
        edges: { node: { messageThreadExternalId: true } },
        pageInfo: { hasNextPage: true, endCursor: true },
      },
    });

    for (const { node } of page?.edges ?? []) {
      if (isNonEmptyString(node.messageThreadExternalId)) {
        repliedThreadExternalIds.add(node.messageThreadExternalId);
      }
    }

    const isEveryThreadFound = repliedThreadExternalIds.size === threadExternalIds.length;

    after =
      !isEveryThreadFound && page?.pageInfo?.hasNextPage ? (page.pageInfo.endCursor ?? undefined) : undefined;
  } while (isDefined(after));

  return repliedThreadExternalIds;
};

// a reply is an incoming message stored after the campaign started, in the conversation of one of its messages
export const findWhatsAppCampaignRecipients = async ({
  client,
  campaignId,
  campaignCreatedAt,
}: {
  client: CoreApiClient;
  campaignId: string;
  campaignCreatedAt: string;
}): Promise<WhatsAppCampaignRecipient[]> => {
  const { messages } = await client.query({
    messages: {
      __args: { filter: { whatsAppCampaignId: { eq: campaignId } }, first: SEND_TEMPLATE_TO_PEOPLE_MAX_RECIPIENTS },
      edges: {
        node: {
          id: true,
          receivedAt: true,
          whatsAppStatus: true,
          whatsAppStatusError: true,
          messageParticipants: {
            edges: {
              node: {
                role: true,
                handle: true,
                displayName: true,
                personId: true,
                person: { name: { firstName: true, lastName: true } },
              },
            },
          },
        },
      },
    },
  });
  const campaignMessages: CampaignMessageNode[] = (messages?.edges ?? []).map(
    ({ node }: { node: CampaignMessageNode }) => node,
  );

  if (campaignMessages.length === 0) {
    return [];
  }

  const { messageChannelMessageAssociations: campaignAssociations } = await client.query({
    messageChannelMessageAssociations: {
      __args: {
        filter: { messageId: { in: campaignMessages.map(({ id }) => id) } },
        first: SEND_TEMPLATE_TO_PEOPLE_MAX_RECIPIENTS,
      },
      edges: { node: { messageId: true, messageThreadExternalId: true } },
    },
  });
  const threadExternalIdByMessageId = new Map<string, string>(
    (campaignAssociations?.edges ?? []).flatMap(
      ({ node }: { node: { messageId: string; messageThreadExternalId: string | null } }) =>
        isNonEmptyString(node.messageThreadExternalId) ? [[node.messageId, node.messageThreadExternalId]] : [],
    ),
  );
  const threadExternalIds = [...new Set(threadExternalIdByMessageId.values())];

  const repliedThreadExternalIds = await findRepliedThreadExternalIds({ client, threadExternalIds, campaignCreatedAt });

  return campaignMessages.map((message) => {
    const recipient = message.messageParticipants?.edges.find(({ node }) => node.role === 'TO')?.node;
    const personName = [recipient?.person?.name?.firstName, recipient?.person?.name?.lastName]
      .filter(isNonEmptyString)
      .join(' ');
    const threadExternalId = threadExternalIdByMessageId.get(message.id);

    return {
      messageId: message.id,
      personId: recipient?.personId ?? null,
      recipientName: isNonEmptyString(personName) ? personName : (recipient?.displayName ?? null),
      recipientHandle: recipient?.handle ?? null,
      sentAt: message.receivedAt,
      status: message.whatsAppStatus,
      statusError: message.whatsAppStatusError,
      hasReplied: threadExternalId !== undefined && repliedThreadExternalIds.has(threadExternalId),
    };
  });
};
