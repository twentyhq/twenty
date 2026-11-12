import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { AiChatMessageAuthorAvatar } from '@/ai/components/AiChatMessageAuthorAvatar';
import { AiChatMessageAuthorResolver } from '@/ai/components/AiChatMessageAuthorResolver';
import { useAgentChatMessageAuthor } from '@/ai/hooks/useAgentChatMessageAuthor';
import { ChatMessageHeader } from '@/chat/components/ChatMessageHeader';

type AiChatMessageAuthorHeaderProps = {
  message: Pick<ExtendedUIMessage, 'id' | 'role' | 'metadata'>;
  createdAt: Date | string;
};

export const AiChatMessageAuthorHeader = ({
  message,
  createdAt,
}: AiChatMessageAuthorHeaderProps) => {
  const author = useAgentChatMessageAuthor(message);

  if (!isDefined(author)) {
    return null;
  }

  return (
    <AiChatMessageAuthorResolver author={author}>
      {(resolvedAuthor) => (
        <ChatMessageHeader
          avatar={<AiChatMessageAuthorAvatar author={resolvedAuthor} />}
          name={resolvedAuthor.name}
          createdAt={createdAt}
        />
      )}
    </AiChatMessageAuthorResolver>
  );
};
