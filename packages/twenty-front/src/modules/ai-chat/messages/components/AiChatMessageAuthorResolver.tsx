import { type ReactNode } from 'react';

import { AiChatAgentAuthorResolver } from '@/ai-chat/messages/components/AiChatAgentAuthorResolver';
import { type AiChatMessageAuthor } from '@/ai-chat/messages/types/AiChatMessageAuthor';

type AiChatMessageAuthorResolverProps = {
  author: AiChatMessageAuthor;
  children: (author: AiChatMessageAuthor) => ReactNode;
};

export const AiChatMessageAuthorResolver = ({
  author,
  children,
}: AiChatMessageAuthorResolverProps) =>
  author.type === 'agent' ? (
    <AiChatAgentAuthorResolver agentId={author.agentId}>
      {children}
    </AiChatAgentAuthorResolver>
  ) : (
    <>{children(author)}</>
  );
