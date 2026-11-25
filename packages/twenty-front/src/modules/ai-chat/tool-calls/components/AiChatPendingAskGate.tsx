import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useState } from 'react';
import { CountPager } from 'twenty-ui/components/navigation';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatAskCard } from '@/ai-chat/tool-calls/components/AiChatAskCard';
import { AiChatRecordApprovalDeck } from '@/ai-chat/tool-calls/components/AiChatRecordApprovalDeck';
import { useAiChatPendingToolCalls } from '@/ai-chat/tool-calls/hooks/useAiChatPendingToolCalls';
import { isAiChatPendingRecordApproval } from '@/ai-chat/tool-calls/utils/isAiChatPendingRecordApproval';

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
  batchToolCallIds: string[];
};

export const AiChatPendingAskGate = ({
  children,
}: AiChatPendingAskGateProps) => {
  const { t } = useLingui();
  const pendingToolCalls = useAiChatPendingToolCalls();
  const { threadId } = useAiChatInstanceOrThrow();
  const [selection, setSelection] = useState<RequestSelection>({
    threadId: null,
    toolCallId: null,
    index: 0,
    batchToolCallIds: [],
  });

  const [answeringToolCallIds, setAnsweringToolCallIds] = useState<string[]>(
    [],
  );

  if (pendingToolCalls.length === 0) {
    return children;
  }

  const requestCount = pendingToolCalls.length;
  const pendingRecordApprovals = pendingToolCalls.filter(
    isAiChatPendingRecordApproval,
  );
  const isReviewingRecordApprovals =
    pendingRecordApprovals.length === requestCount &&
    (requestCount > 1 ||
      answeringToolCallIds.includes(pendingToolCalls[0].toolCallId));

  if (isReviewingRecordApprovals) {
    return (
      <AiChatRecordApprovalDeck
        recordApprovals={pendingRecordApprovals}
        answeringToolCallIds={answeringToolCallIds}
        onAnsweringToolCallIdsChange={setAnsweringToolCallIds}
      />
    );
  }

  const selectedIndex = pendingToolCalls.findIndex(
    (pendingToolCall) => pendingToolCall.toolCallId === selection.toolCallId,
  );
  const isSameBatch =
    selection.threadId === threadId &&
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
      threadId,
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
          <AiChatAskCard
            pendingToolCall={pendingToolCall}
            isActive={index === currentIndex}
          />
        </div>
      ))}
    </StyledGate>
  );
};
