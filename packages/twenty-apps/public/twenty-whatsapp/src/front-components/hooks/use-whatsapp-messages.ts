import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { type WhatsappMessageItem } from 'src/front-components/types/whatsapp-message-item.type';
import { fetchWhatsappMessageChannels } from 'src/logic-functions/utils/fetch-whatsapp-message-channels.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

type WhatsappMessagesState = {
  whatsappMessages: WhatsappMessageItem[];
  isWhatsappMessagesQueryLoading: boolean;
  errorMessage: string | undefined;
};

const PEOPLE_LOOKUP_LIMIT = 50;
const MESSAGES_LOOKUP_LIMIT = 200;
const WHATSAPP_MESSAGES_ERROR_MESSAGE = 'Please try again later.';
const CHANNEL_NOT_CONFIGURED_MESSAGE =
  'Connect a WhatsApp Business account to see messages.';

const fetchWhatsappMessages = async ({
  recordId,
  messageChannelIds,
}: {
  recordId: string;
  messageChannelIds: string[];
}): Promise<WhatsappMessageItem[]> => {
  const client = new CoreApiClient();

  const peopleQueryResult = await client.query({
    people: {
      __args: {
        filter: {
          or: [{ id: { eq: recordId } }, { companyId: { eq: recordId } }],
        },
        first: PEOPLE_LOOKUP_LIMIT,
      },
      edges: {
        node: {
          id: true,
        },
      },
    },
  });

  const personIds = (peopleQueryResult.people?.edges ?? [])
    .map((personEdge: { node: { id?: string | null } }) => personEdge.node.id)
    .filter(isNonEmptyString);

  if (personIds.length === 0) {
    return [];
  }

  const participantsQueryResult = await client.query({
    messageParticipants: {
      __args: {
        filter: { personId: { in: personIds } },
        first: MESSAGES_LOOKUP_LIMIT,
      },
      edges: {
        node: {
          id: true,
          message: {
            id: true,
            text: true,
            receivedAt: true,
          },
        },
      },
    },
  });

  const messageById = new Map<
    string,
    { id: string; text: string; receivedAt: string }
  >();

  for (const participantEdge of participantsQueryResult.messageParticipants
    ?.edges ?? []) {
    const message = participantEdge.node.message;

    if (
      isNonEmptyString(message?.id) &&
      isNonEmptyString(message?.text) &&
      isNonEmptyString(message?.receivedAt)
    ) {
      messageById.set(message.id, {
        id: message.id,
        text: message.text,
        receivedAt: message.receivedAt,
      });
    }
  }

  const messageIds = [...messageById.keys()];

  if (messageIds.length === 0) {
    return [];
  }

  const associationsQueryResult = await client.query({
    messageChannelMessageAssociations: {
      __args: {
        filter: {
          messageId: { in: messageIds },
          messageChannelId: { in: messageChannelIds },
        },
        first: MESSAGES_LOOKUP_LIMIT,
      },
      edges: {
        node: {
          messageId: true,
          direction: true,
        },
      },
    },
  });

  const whatsappMessages: WhatsappMessageItem[] = [];

  for (const associationEdge of associationsQueryResult
    .messageChannelMessageAssociations?.edges ?? []) {
    const { messageId, direction } = associationEdge.node;
    const message = isNonEmptyString(messageId)
      ? messageById.get(messageId)
      : undefined;

    if (
      message !== undefined &&
      (direction === 'INCOMING' || direction === 'OUTGOING')
    ) {
      whatsappMessages.push({ ...message, direction });
    }
  }

  return whatsappMessages.sort(
    (left, right) =>
      new Date(right.receivedAt).getTime() -
      new Date(left.receivedAt).getTime(),
  );
};

export const useWhatsappMessages = (
  recordId: string,
): WhatsappMessagesState => {
  const [state, setState] = useState<WhatsappMessagesState>({
    whatsappMessages: [],
    isWhatsappMessagesQueryLoading: true,
    errorMessage: undefined,
  });

  useEffect(() => {
    let cancelled = false;

    const fetchMessages = async () => {
      setState({
        whatsappMessages: [],
        isWhatsappMessagesQueryLoading: true,
        errorMessage: undefined,
      });

      try {
        const whatsappMessageChannels = await fetchWhatsappMessageChannels();

        if (whatsappMessageChannels.length === 0) {
          if (cancelled) {
            return;
          }

          setState({
            whatsappMessages: [],
            isWhatsappMessagesQueryLoading: false,
            errorMessage: CHANNEL_NOT_CONFIGURED_MESSAGE,
          });
          return;
        }

        const whatsappMessages = await fetchWhatsappMessages({
          recordId,
          messageChannelIds: whatsappMessageChannels.map(
            ({ messageChannelId }) => messageChannelId,
          ),
        });

        if (cancelled) {
          return;
        }

        setState({
          whatsappMessages,
          isWhatsappMessagesQueryLoading: false,
          errorMessage: undefined,
        });
      } catch {
        if (cancelled) {
          return;
        }

        setState({
          whatsappMessages: [],
          isWhatsappMessagesQueryLoading: false,
          errorMessage: WHATSAPP_MESSAGES_ERROR_MESSAGE,
        });
      }
    };

    fetchMessages();

    return () => {
      cancelled = true;
    };
  }, [recordId]);

  return state;
};
