import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';
import { getDisplayNameFromParticipant } from '@/activities/emails/utils/getDisplayNameFromParticipant';
import { getEmailParticipantAvatarColorSeed } from '@/activities/emails/utils/getEmailParticipantAvatarColorSeed';
import { ChatMessageHeader } from '@/chat/components/ChatMessageHeader';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type ChatThreadMessageSenderHeaderProps = {
  sender: EmailThreadMessageParticipant;
  receivedAt?: string | null;
};

export const ChatThreadMessageSenderHeader = ({
  sender,
  receivedAt,
}: ChatThreadMessageSenderHeaderProps) => {
  const displayName = getDisplayNameFromParticipant({
    participant: sender,
    shouldUseFullName: true,
  });

  return (
    <ChatMessageHeader
      avatar={
        <Avatar
          src={getAbsoluteImageUrl(
            sender.person?.avatarUrl ?? sender.workspaceMember?.avatarUrl,
          )}
          colorSeed={getEmailParticipantAvatarColorSeed(sender)}
          name={displayName}
          size="sm"
          shape="circle"
        />
      }
      name={displayName}
      createdAt={receivedAt ?? undefined}
    />
  );
};
