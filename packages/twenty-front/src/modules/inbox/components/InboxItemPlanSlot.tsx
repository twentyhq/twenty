import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { InboxPlanToolCallRow } from '@/inbox/components/InboxPlanToolCallRow';
import { useInboxItemPlanContext } from '@/inbox/hooks/useInboxItemPlanContext';

const StyledPlanCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
`;

const StyledPlanHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledPlanTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledPlanCount = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledPlanRow = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

// The plan as rows, minus whichever call the featured slot is drawing in
// full. Every row starts folded; the person opens the ones they want to
// change.
export const InboxItemPlanSlot = () => {
  const { t } = useLingui();
  const {
    inboxItem,
    isBusy,
    featuredToolCall,
    otherToolCalls,
    otherPendingToolCallCount,
    runToolCall,
    saveToolCallInput,
    setToolCallRejected,
    registerFlush,
  } = useInboxItemPlanContext();
  const [expandedToolCallIds, setExpandedToolCallIds] = useState<string[]>([]);

  if (otherToolCalls.length === 0) {
    return null;
  }

  const toggleToolCall = (toolCallId: string) =>
    setExpandedToolCallIds((current) =>
      current.includes(toolCallId)
        ? current.filter((id) => id !== toolCallId)
        : [...current, toolCallId],
    );

  return (
    <StyledPlanCard>
      <StyledPlanHeader>
        <StyledPlanTitle>
          {isDefined(featuredToolCall) ? t`Also in this plan` : t`Plan`}
        </StyledPlanTitle>
        {otherPendingToolCallCount > 0 && (
          <StyledPlanCount>
            {otherPendingToolCallCount === 1
              ? t`1 step to do`
              : t`${otherPendingToolCallCount} steps to do`}
          </StyledPlanCount>
        )}
      </StyledPlanHeader>
      {otherToolCalls.map((toolCall) => (
        <StyledPlanRow key={toolCall.id}>
          <InboxPlanToolCallRow
            toolCall={toolCall}
            source={inboxItem.context.source ?? undefined}
            isExpanded={expandedToolCallIds.includes(toolCall.id)}
            isBusy={isBusy}
            onToggleExpanded={() => toggleToolCall(toolCall.id)}
            onRun={() => runToolCall(toolCall.id)}
            onSave={(editedInput) =>
              saveToolCallInput(toolCall.id, editedInput)
            }
            onToggleRejected={(isRejected) =>
              setToolCallRejected(toolCall.id, isRejected)
            }
            onRegisterFlush={(flush) => registerFlush(toolCall.id, flush)}
          />
        </StyledPlanRow>
      ))}
    </StyledPlanCard>
  );
};
