import { useCallback, useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { type WhatsappMessageItem } from 'src/front-components/types/whatsapp-message-item.type';
import { resolveWhatsappReplyRecipient } from 'src/front-components/utils/resolve-whatsapp-reply-recipient.util';
import { fetchWhatsappMessageChannels } from 'src/logic-functions/utils/fetch-whatsapp-message-channels.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

type WhatsappMessagesState = {
  whatsappMessages: WhatsappMessageItem[];
  isWhatsappMessagesQueryLoading: boolean;
  errorMessage: string | undefined;
  connectedAccountId: string | undefined;
  replyRecipientHandle: string | undefined;
};

const PEOPLE_LOOKUP_LIMIT = 50;
const MESSAGES_LOOKUP_LIMIT = 200;
const WHATSAPP_MESSAGES_REFRESH_INTERVAL_MS = 10_000;
const WHATSAPP_MESSAGES_ERROR_MESSAGE = 'Please try again later.';
const CHANNEL_NOT_CONFIGURED_MESSAGE =
  'Connect a WhatsApp Business account to see messages.';

const EMPTY_WHATSAPP_MESSAGES_STATE: WhatsappMessagesState = {
  whatsappMessages: [],
  isWhatsappMessagesQueryLoading: false,
  errorMessage: undefined,
  connectedAccountId: undefined,
  replyRecipientHandle: undefined,
};

const fetchWhatsappConversation = async ({
  recordId,
  messageChannelIds,
}: {
  recordId: string;
  messageChannelIds: string[];
}): Promise<{
  whatsappMessages: WhatsappMessageItem[];
  replyRecipientHandle: string | undefined;
}> => {
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
          phones: {
            primaryPhoneCallingCode: true,
            primaryPhoneNumber: true,
          },
        },
      },
    },
  });

  type PersonNode = {
    id?: string | null;
    phones?: {
      primaryPhoneCallingCode?: string | null;
      primaryPhoneNumber?: string | null;
    } | null;
  };

  const people: PersonNode[] = (peopleQueryResult.people?.edges ?? []).map(
    (personEdge: { node: PersonNode }) => personEdge.node,
  );

  const personIds = people.map((person) => person.id).filter(isNonEmptyString);

  const phonesWithNumber = people
    .map((person) => person.phones)
    .find((phones) => isNonEmptyString(phones?.primaryPhoneNumber));

  const personPhones = isNonEmptyString(phonesWithNumber?.primaryPhoneNumber)
    ? {
        primaryPhoneCallingCode: phonesWithNumber.primaryPhoneCallingCode ?? '',
        primaryPhoneNumber: phonesWithNumber.primaryPhoneNumber,
      }
    : undefined;

  if (personIds.length === 0) {
    return {
      whatsappMessages: [],
      replyRecipientHandle: resolveWhatsappReplyRecipient({
        whatsappParticipants: [],
        personPhones,
      }),
    };
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
          handle: true,
          role: true,
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
  const participantsByMessageId = new Map<
    string,
    { handle: string; role: string }[]
  >();

  for (const participantEdge of participantsQueryResult.messageParticipants
    ?.edges ?? []) {
    const { handle, role, message } = participantEdge.node;

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

      participantsByMessageId.set(message.id, [
        ...(participantsByMessageId.get(message.id) ?? []),
        { handle: handle ?? '', role: role ?? '' },
      ]);
    }
  }

  const messageIds = [...messageById.keys()];

  if (messageIds.length === 0) {
    return {
      whatsappMessages: [],
      replyRecipientHandle: resolveWhatsappReplyRecipient({
        whatsappParticipants: [],
        personPhones,
      }),
    };
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

  const whatsappParticipants = whatsappMessages.flatMap(
    (whatsappMessage) => participantsByMessageId.get(whatsappMessage.id) ?? [],
  );

  return {
    whatsappMessages: whatsappMessages.sort(
      (left, right) =>
        new Date(right.receivedAt).getTime() -
        new Date(left.receivedAt).getTime(),
    ),
    replyRecipientHandle: resolveWhatsappReplyRecipient({
      whatsappParticipants,
      personPhones,
    }),
  };
};

export const useWhatsappMessages = (
  recordId: string,
): WhatsappMessagesState & { refetchWhatsappMessages: () => void } => {
  const [state, setState] = useState<WhatsappMessagesState>({
    ...EMPTY_WHATSAPP_MESSAGES_STATE,
    isWhatsappMessagesQueryLoading: true,
  });
  const [refreshCount, setRefreshCount] = useState(0);

  const refetchWhatsappMessages = useCallback(() => {
    setRefreshCount((currentRefreshCount) => currentRefreshCount + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchMessages = async ({
      showLoadingState,
    }: {
      showLoadingState: boolean;
    }) => {
      if (showLoadingState) {
        setState({
          ...EMPTY_WHATSAPP_MESSAGES_STATE,
          isWhatsappMessagesQueryLoading: true,
        });
      }

      try {
        const whatsappMessageChannels = await fetchWhatsappMessageChannels();

        if (whatsappMessageChannels.length === 0) {
          if (cancelled) {
            return;
          }

          setState({
            ...EMPTY_WHATSAPP_MESSAGES_STATE,
            errorMessage: CHANNEL_NOT_CONFIGURED_MESSAGE,
          });
          return;
        }

        const { whatsappMessages, replyRecipientHandle } =
          await fetchWhatsappConversation({
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
          connectedAccountId: whatsappMessageChannels[0].connectedAccountId,
          replyRecipientHandle,
        });
      } catch {
        if (cancelled || !showLoadingState) {
          return;
        }

        setState({
          ...EMPTY_WHATSAPP_MESSAGES_STATE,
          errorMessage: WHATSAPP_MESSAGES_ERROR_MESSAGE,
        });
      }
    };

    fetchMessages({ showLoadingState: refreshCount === 0 });

    const refreshIntervalId = setInterval(
      () => fetchMessages({ showLoadingState: false }),
      WHATSAPP_MESSAGES_REFRESH_INTERVAL_MS,
    );

    return () => {
      cancelled = true;
      clearInterval(refreshIntervalId);
    };
  }, [recordId, refreshCount]);

  return { ...state, refetchWhatsappMessages };
};
