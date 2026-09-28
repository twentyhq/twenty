import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconChevronLeft, IconChevronRight } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatAskCard } from '@/ai/components/AiChatAskCard';
import { useAgentChatPendingToolCalls } from '@/ai/hooks/useAgentChatPendingToolCalls';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

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
  threadId: string | null;
  toolCallId: string | null;
  index: number;
  // the requests pending when one was picked, to tell a later batch from this one
  batchToolCallIds: string[];
};

// The agent resumes once every paused call is answered. Each call is answered on its own, in any
// order, and every card stays mounted so what is typed in one survives going to another.
export const AiChatPendingAskGate = ({
  children,
}: AiChatPendingAskGateProps) => {
  const { t } = useLingui();
  const pendingToolCalls = useAgentChatPendingToolCalls();
  const agentChatDisplayedThread = useAtomStateValue(
    agentChatDisplayedThreadState,
  );
  const [selection, setSelection] = useState<RequestSelection>({
    threadId: null,
    toolCallId: null,
    index: 0,
    batchToolCallIds: [],
  });

  if (pendingToolCalls.length === 0) {
    return children;
  }

  const requestCount = pendingToolCalls.length;
  const selectedIndex = pendingToolCalls.findIndex(
    (pendingToolCall) => pendingToolCall.toolCallId === selection.toolCallId,
  );
  // an answered request leaves the list, so the one taking its place is shown
  // a selection made in another conversation or for an earlier batch does not carry over, so
  // each new set of requests opens on its oldest one
  const isSameBatch =
    selection.threadId === agentChatDisplayedThread &&
    pendingToolCalls.some((pendingToolCall) =>
      selection.batchToolCallIds.includes(pendingToolCall.toolCallId),
    );
  const previousIndex = isSameBatch ? selection.index : 0;
  const currentIndex =
    selectedIndex >= 0
      ? selectedIndex
      : Math.min(previousIndex, requestCount - 1);
  const requestNumber = currentIndex + 1;

  const selectRequest = (index: number) => {
    const requestToSelect = pendingToolCalls[index];

    if (!isDefined(requestToSelect)) {
      return;
    }

    setSelection({
      threadId: agentChatDisplayedThread,
      toolCallId: requestToSelect.toolCallId,
      index,
      batchToolCallIds: pendingToolCalls.map(
        (pendingToolCall) => pendingToolCall.toolCallId,
      ),
    });
  };

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
