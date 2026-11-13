import { type ReactNode } from 'react';

import { AiChatAgentAuthorResolver } from '@/ai/components/AiChatAgentAuthorResolver';
import { type AgentChatMessageAuthor } from '@/ai/types/AgentChatMessageAuthor';

type AiChatMessageAuthorResolverProps = {
  author: AgentChatMessageAuthor;
  children: (author: AgentChatMessageAuthor) => ReactNode;
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
