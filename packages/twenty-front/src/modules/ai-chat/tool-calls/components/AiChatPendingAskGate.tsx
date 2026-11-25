import { type ReactNode } from 'react';

import { AiChatPendingToolCallRequests } from '@/ai-chat/tool-calls/components/AiChatPendingToolCallRequests';
import { useAiChatPendingToolCalls } from '@/ai-chat/tool-calls/hooks/useAiChatPendingToolCalls';

type AiChatPendingAskGateProps = {
  children: ReactNode;
};

export const AiChatPendingAskGate = ({
  children,
}: AiChatPendingAskGateProps) => {
  const pendingToolCalls = useAiChatPendingToolCalls();
  const isComposerShown = pendingToolCalls.every(
    (pendingToolCall) => pendingToolCall.kind === 'toolCallApproval',
  );

  return (
    <>
      {pendingToolCalls.length > 0 && (
        <AiChatPendingToolCallRequests pendingToolCalls={pendingToolCalls} />
      )}
      {isComposerShown && children}
    </>
  );
};
