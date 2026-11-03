import { isNonEmptyString } from '@sniptt/guards';

import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';

export const getChatThreadCounterpartNames = (
  messages: EmailThreadMessageWithSender[],
  outgoingMessageIds: ReadonlySet<string>,
) => [
  ...new Set(
    messages
      .filter(({ id }) => !outgoingMessageIds.has(id))
      .map(({ sender }) => sender?.displayName)
      .filter(isNonEmptyString),
  ),
];
