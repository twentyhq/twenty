import { type EmailThreadMessage } from '@/activities/emails/types/EmailThreadMessage';

export const getOutgoingMessageIds = ({
  messages,
  viewerMessageChannelIds,
}: {
  messages: Pick<
    EmailThreadMessage,
    'id' | 'messageChannelMessageAssociations'
  >[];
  viewerMessageChannelIds: ReadonlySet<string>;
}): ReadonlySet<string> =>
  new Set(
    messages
      .filter((message) =>
        (message.messageChannelMessageAssociations ?? []).some(
          ({ direction, messageChannelId }) =>
            direction === 'OUTGOING' &&
            viewerMessageChannelIds.has(messageChannelId),
        ),
      )
      .map(({ id }) => id),
  );
