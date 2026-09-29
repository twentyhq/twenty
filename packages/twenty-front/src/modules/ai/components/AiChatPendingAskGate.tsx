import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AiChatAskCard } from '@/ai/components/AiChatAskCard';
import { useAgentChatPendingAsk } from '@/ai/hooks/useAgentChatPendingAsk';

type AiChatPendingAskGateProps = {
  threadId: string;
  children: ReactNode;
};

export const AiChatPendingAskGate = ({
  threadId,
  children,
}: AiChatPendingAskGateProps) => {
  const pendingAsk = useAgentChatPendingAsk({ threadId });

  return isDefined(pendingAsk) ? (
    <AiChatAskCard key={pendingAsk.id} pendingAsk={pendingAsk} />
  ) : (
    children
  );
};
