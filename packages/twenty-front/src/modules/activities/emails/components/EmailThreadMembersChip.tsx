import { MessageThreadSubscribersDropdownButton } from '@/activities/emails/components/MessageThreadSubscribersDropdownButton';
import { MessageThread } from '@/activities/emails/types/MessageThread';

export const EmailThreadMembersChip = ({
  messageThread,
}: {
  messageThread: MessageThread;
}) => {
  const subscribers = messageThread.subscribers ?? [];

  const numberOfMessageThreadSubscribers = subscribers.length;

  const shouldShowPrivateLabel = numberOfMessageThreadSubscribers === 1;

  const label = shouldShowPrivateLabel ? 'Private' : '';

  return (
    <MessageThreadSubscribersDropdownButton
      label={label}
      messageThreadSubscribers={subscribers}
    />
  );
};
