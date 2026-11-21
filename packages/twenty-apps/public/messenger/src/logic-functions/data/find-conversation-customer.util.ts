import { isDefined } from 'twenty-sdk/utils';

import {
  type ConversationsApiMessage,
  type ConversationsApiParticipant,
} from 'src/logic-functions/types/conversations-api.type';

export const findConversationCustomer = ({
  pageId,
  messages,
}: {
  pageId: string;
  messages: ConversationsApiMessage[];
}): ConversationsApiParticipant | undefined =>
  messages
    .flatMap(({ from, to }) => [from, ...to.data])
    .find((participant) => isDefined(participant) && participant.id !== pageId);
