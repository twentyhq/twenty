import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useState } from 'react';
import { CountPager } from 'twenty-ui/components/navigation';
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
  padding: 0 ${themeCssVariables.spacing[1]};
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

  const selectRequest = (index: number) =>
    setSelection({
      threadId: agentChatDisplayedThread,
      toolCallId: pendingToolCalls[index].toolCallId,
      index,
      batchToolCallIds: pendingToolCalls.map(
        (pendingToolCall) => pendingToolCall.toolCallId,
      ),
    });

  return (
    <StyledGate>
      {requestCount > 1 && (
        <StyledStepper>
          <CountPager
            aria-label={t`Pending requests`}
            index={currentIndex}
            count={requestCount}
            onIndexChange={selectRequest}
            positionText={t`Request ${requestNumber} of ${requestCount}`}
            positionPlacement="start"
            previousLabel={t`Previous request`}
            nextLabel={t`Next request`}
          />
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
