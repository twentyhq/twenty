import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AiChatQuestionCard } from '@/ai/components/AiChatQuestionCard';
import { useAgentChatPendingQuestion } from '@/ai/hooks/useAgentChatPendingQuestion';

type AiChatPendingQuestionGateProps = {
  threadId: string;
  children: ReactNode;
};

export const AiChatPendingQuestionGate = ({
  threadId,
  children,
}: AiChatPendingQuestionGateProps) => {
  const pendingQuestion = useAgentChatPendingQuestion({ threadId });

  return isDefined(pendingQuestion) ? (
    <AiChatQuestionCard
      key={pendingQuestion.toolCallId}
      pendingQuestion={pendingQuestion}
    />
  ) : (
    children
  );
};
