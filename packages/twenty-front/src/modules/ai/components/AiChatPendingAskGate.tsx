import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useState } from 'react';
import { LightIconButton } from 'twenty-ui/components';
import { IconChevronLeft, IconChevronRight } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatAskCard } from '@/ai/components/AiChatAskCard';
import { useAgentChatPendingToolCalls } from '@/ai/hooks/useAgentChatPendingToolCalls';

const StyledGate = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

const StyledStepper = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  padding: 0 ${themeCssVariables.spacing[1]};
`;

const StyledStepperLabel = styled.span`
  color: ${themeCssVariables.font.color.light};
  flex: 1;
  font-size: ${themeCssVariables.font.size.sm};
`;

type AiChatPendingAskGateProps = {
  children: ReactNode;
};

type RequestSelection = {
  toolCallId: string | null;
  index: number;
};

// The agent resumes once every paused call is answered. Each call is answered on its own, in any
// order, and every card stays mounted so what is typed in one survives going to another.
export const AiChatPendingAskGate = ({
  children,
}: AiChatPendingAskGateProps) => {
  const { t } = useLingui();
  const pendingToolCalls = useAgentChatPendingToolCalls();
  const [selection, setSelection] = useState<RequestSelection>({
    toolCallId: null,
    index: 0,
  });

  if (pendingToolCalls.length === 0) {
    return children;
  }

  const requestCount = pendingToolCalls.length;
  const selectedIndex = pendingToolCalls.findIndex(
    (pendingToolCall) => pendingToolCall.toolCallId === selection.toolCallId,
  );
  // an answered request leaves the list, so the one taking its place is shown
  const currentIndex =
    selectedIndex >= 0
      ? selectedIndex
      : Math.min(selection.index, requestCount - 1);
  const requestNumber = currentIndex + 1;

  const selectRequest = (index: number) =>
    setSelection({ toolCallId: pendingToolCalls[index].toolCallId, index });

  return (
    <StyledGate>
      {requestCount > 1 && (
        <StyledStepper>
          <StyledStepperLabel>
            {t`Request ${requestNumber} of ${requestCount}`}
          </StyledStepperLabel>
          <LightIconButton
            size="sm"
            disabled={currentIndex === 0}
            onClick={() => selectRequest(currentIndex - 1)}
            aria-label={t`Previous request`}
          >
            <IconChevronLeft />
          </LightIconButton>
          <LightIconButton
            size="sm"
            disabled={currentIndex === requestCount - 1}
            onClick={() => selectRequest(currentIndex + 1)}
            aria-label={t`Next request`}
          >
            <IconChevronRight />
          </LightIconButton>
        </StyledStepper>
      )}
      {pendingToolCalls.map((pendingToolCall, index) => (
        <div key={pendingToolCall.toolCallId} hidden={index !== currentIndex}>
          <AiChatAskCard pendingToolCall={pendingToolCall} />
        </div>
      ))}
    </StyledGate>
  );
};
