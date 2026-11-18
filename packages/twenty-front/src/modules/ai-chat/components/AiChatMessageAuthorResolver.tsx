import { type ReactNode } from 'react';

import { AiChatAgentAuthorResolver } from '@/ai-chat/components/AiChatAgentAuthorResolver';
import { type AiChatMessageAuthor } from '@/ai-chat/types/AiChatMessageAuthor';

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
