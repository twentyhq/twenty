import { MessageThread } from '@/activities/emails/types/MessageThread';
import { SharedDropdownMenu } from '@/ui/layout/dropdown/components/SharedDropdownMenu';

export const EmailThreadMembersChip = ({
  messageThread,
}: {
  messageThread: MessageThread | null;
}) => {
  const renderChip = () => {
    if (!messageThread) {
      return null;
    }
    const isEveryone = messageThread?.everyone;
    const numberOfMessageThreadMembers =
      messageThread.messageThreadMember.length;
    switch (isEveryone) {
      case false:
        if (numberOfMessageThreadMembers === 1) {
          return (
            <SharedDropdownMenu
              label="Private"
              messageThreadMembers={messageThread.messageThreadMember}
            />
          );
        } else {
          return (
            <SharedDropdownMenu
              messageThreadMembers={messageThread.messageThreadMember}
            />
          );
        }
      case true:
        return (
          <SharedDropdownMenu
            label="Everyone"
            messageThreadMembers={messageThread.messageThreadMember}
            everyone={true}
          />
        );
      default:
        return null;
    }
  };

  return <>{renderChip()} </>;
};
