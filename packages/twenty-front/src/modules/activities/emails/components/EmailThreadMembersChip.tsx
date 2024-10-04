import { MessageThreadSubscribersDropdownButton } from '@/activities/emails/components/MessageThreadSubscribersDropdownButton';
import { MessageThread } from '@/activities/emails/types/MessageThread';

export const EmailThreadMembersChip = ({
  messageThread,
}: {
  messageThread: MessageThread;
}) => {
  const subscribers = messageThread.subscribers ?? [];

  return (
    <MessageThreadSubscribersDropdownButton
      messageThreadSubscribers={subscribers}
    />
  );
};
