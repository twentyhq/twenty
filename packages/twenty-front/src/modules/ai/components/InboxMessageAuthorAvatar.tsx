import { Avatar } from 'twenty-ui/primitives/data-display';

import { AiChatAssistantAvatar } from '@/ai/components/AiChatAssistantAvatar';
import { type InboxMessageAuthor } from '@/ai/types/InboxMessageAuthor';
import { AppChip } from '@/applications/components/AppChip';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type InboxMessageAuthorAvatarProps = {
  author: InboxMessageAuthor;
};

export const InboxMessageAuthorAvatar = ({
  author,
}: InboxMessageAuthorAvatarProps) => {
  switch (author.type) {
    case 'builtInAssistant':
      return <AiChatAssistantAvatar />;
    case 'application':
      return <AppChip applicationId={author.applicationId} chipOnly rounded />;
    case 'agent':
      return (
        <Avatar
          colorSeed={author.agentId}
          name={author.name}
          size="sm"
          shape="circle"
        />
      );
    case 'member':
      return (
        <Avatar
          src={getAbsoluteImageUrl(author.sender?.avatarUrl)}
          colorSeed={author.senderWorkspaceMemberId}
          name={author.name}
          size="sm"
          shape="circle"
        />
      );
    case 'unknown':
      return (
        <Avatar
          colorSeed={author.messageId}
          name={author.name}
          size="sm"
          shape="circle"
        />
      );
  }
};
