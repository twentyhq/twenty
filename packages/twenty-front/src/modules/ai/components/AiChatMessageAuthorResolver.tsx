import { type ReactNode } from 'react';

import { AiChatAgentAuthorResolver } from '@/ai/components/AiChatAgentAuthorResolver';
import { type InboxMessageAuthor } from '@/ai/types/AgentChatMessageAuthor';

type InboxMessageAuthorResolverProps = {
  author: InboxMessageAuthor;
  children: (author: InboxMessageAuthor) => ReactNode;
};

export const InboxMessageAuthorResolver = ({
  author,
  children,
}: InboxMessageAuthorResolverProps) =>
  author.type === 'agent' ? (
    <AiChatAgentAuthorResolver agentId={author.agentId}>
      {children}
    </AiChatAgentAuthorResolver>
  ) : (
    <>{children(author)}</>
  );
