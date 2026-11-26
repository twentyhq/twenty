import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatPendingToolCallRequests } from '@/ai-chat/tool-calls/components/AiChatPendingToolCallRequests';
import { AiChatIsToolCallDockedContext } from '@/ai-chat/tool-calls/contexts/AiChatIsToolCallDockedContext';
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
      !pendingToolCall.isAwaitedByCaller,
  );
  const requests = (
    <AiChatPendingToolCallRequests pendingToolCalls={pendingToolCalls} />
  );

  return (
    <StyledInputStack>
      {hasPendingToolCalls &&
        (isComposerShown ? (
          <AiChatIsToolCallDockedContext.Provider value={true}>
            <StyledBlockingToolInset>{requests}</StyledBlockingToolInset>
          </AiChatIsToolCallDockedContext.Provider>
        ) : (
          requests
        ))}
      {isComposerShown && children}
    </StyledInputStack>
  );
};
