import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useInboxItemPlanContext } from '@/inbox/hooks/useInboxItemPlanContext';
import { type InboxToolCallStarter } from '@/inbox/tool-call-renderers/types/InboxToolCallRenderer';

const StyledStarter = styled.button`
  align-items: center;
  all: unset;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
    color: ${themeCssVariables.font.color.secondary};
  }

  &:disabled {
    cursor: default;
  }
`;

type InboxToolCallStarterButtonProps = {
  starter: InboxToolCallStarter;
};

// One row per tool that can be started from the subject. Clicking adds the
// tool's proposal to the plan as a proposed call; from there the featured
// slot, the footer and the audit row take over as for any other step.
export const InboxToolCallStarterButton = ({
  starter,
}: InboxToolCallStarterButtonProps) => {
  const { inboxItem, isBusy, createToolCall } = useInboxItemPlanContext();
  const proposal = starter.useProposal(inboxItem);
  const StarterIcon = starter.Icon;

  return (
    <StyledStarter
      type="button"
      disabled={isBusy || !isDefined(proposal)}
      onClick={() => {
        if (isDefined(proposal)) {
          void createToolCall(proposal);
        }
      }}
    >
      <StarterIcon size={16} />
      {starter.label()}
    </StyledStarter>
  );
};
