import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/primitives/data-display';

import { AiChatMessageAuthorAvatar } from '@/ai/components/AiChatMessageAuthorAvatar';
import { AiChatMessageAuthorResolver } from '@/ai/components/AiChatMessageAuthorResolver';
import { type AgentChatMessageAuthor } from '@/ai/types/AgentChatMessageAuthor';

type AiChatMessageReplyQuoteAvatarProps = {
  quotedMessageAuthor: Nullable<AgentChatMessageAuthor>;
  quotedAuthorName: string;
};

export const AiChatMessageReplyQuoteAvatar = ({
  quotedMessageAuthor,
  quotedAuthorName,
}: AiChatMessageReplyQuoteAvatarProps) => {
  if (!isDefined(quotedMessageAuthor)) {
    return <Avatar name={quotedAuthorName} size="sm" shape="circle" />;
  }

  return (
    <AiChatMessageAuthorResolver author={quotedMessageAuthor}>
      {(author) => <AiChatMessageAuthorAvatar author={author} />}
    </AiChatMessageAuthorResolver>
  );
};
