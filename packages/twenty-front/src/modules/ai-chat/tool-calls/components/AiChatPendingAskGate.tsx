import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatPendingToolCallRequests } from '@/ai-chat/tool-calls/components/AiChatPendingToolCallRequests';
import { useAiChatPendingToolCalls } from '@/ai-chat/tool-calls/hooks/useAiChatPendingToolCalls';

const StyledInputStack = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledBlockingToolInset = styled.div`
  box-sizing: border-box;
  padding: 0 ${themeCssVariables.spacing[2]};
  width: 100%;

  [data-blocking-tool-card] {
    border-bottom: 0;
    border-radius: ${themeCssVariables.border.radius.sm}
      ${themeCssVariables.border.radius.sm} 0 0;
  }
`;

type AiChatPendingAskGateProps = {
  children: ReactNode;
};

export const AiChatPendingAskGate = ({
  children,
}: AiChatPendingAskGateProps) => {
  const pendingToolCalls = useAiChatPendingToolCalls();
  const hasPendingToolCalls = pendingToolCalls.length > 0;
  const isComposerShown = pendingToolCalls.every(
    (pendingToolCall) =>
      pendingToolCall.kind === 'toolCallApproval' &&
      !pendingToolCall.isPostedByWorkflow,
  );
  const requests = (
    <AiChatPendingToolCallRequests pendingToolCalls={pendingToolCalls} />
  );

  return (
    <StyledInputStack>
      {hasPendingToolCalls &&
        (isComposerShown ? (
          <StyledBlockingToolInset>{requests}</StyledBlockingToolInset>
        ) : (
          requests
        ))}
      {isComposerShown && children}
    </StyledInputStack>
  );
};
