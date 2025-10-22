import { workflowRunIteratorSubStepIterationIndexComponentState } from '@/command-menu/pages/workflow/step/view-run/states/workflowRunIteratorSubStepIterationIndexComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import { useWorkflowRunIdOrThrow } from '@/workflow/hooks/useWorkflowRunIdOrThrow';
import { getStepDefinitionOrThrow } from '@/workflow/utils/getStepDefinitionOrThrow';
import { getIsDescendantOfIterator } from '@/workflow/workflow-steps/utils/getIsDescendantOfIterator';
import { getWorkflowRunAllStepInfoHistory } from '@/workflow/workflow-steps/utils/getWorkflowRunAllStepInfoHistory';
import styled from '@emotion/styled';
import { plural } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, IconChevronRight } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-block: ${({ theme }) => theme.spacing(2)};
  padding-inline: ${({ theme }) => theme.spacing(3)};
`;

const StyledCounter = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

export const WorkflowIteratorSubStepSwitcher = ({
  stepId,
}: {
  stepId: string;
}) => {
  const flow = useFlowOrThrow();
  const workflowRunId = useWorkflowRunIdOrThrow();
  const workflowRun = useWorkflowRun({ workflowRunId });

  const [
    workflowRunIteratorSubStepIterationIndex,
    setWorkflowRunIteratorSubStepIterationIndex,
  ] = useRecoilComponentState(
    workflowRunIteratorSubStepIterationIndexComponentState,
  );

  const stepDefinition = getStepDefinitionOrThrow({
    stepId,
    trigger: flow.trigger,
    steps: flow.steps,
  });

  const stepInfo = workflowRun?.state?.stepInfos[stepId];

  if (
    !isDefined(stepInfo) ||
    !isDefined(workflowRun?.state) ||
    !isDefined(flow.steps) ||
    stepDefinition?.type !== 'action'
  ) {
    return null;
  }

  const allStepInfos = getWorkflowRunAllStepInfoHistory({
    stepInfo,
  });

  const isDescendantOfIterator = getIsDescendantOfIterator({
    stepId,
    steps: flow.steps,
  });

  const workflowRunIteratorSubStepIterationsCount = allStepInfos.length;

  const canGoToPreviousIndex = workflowRunIteratorSubStepIterationIndex > 0;
  const canGoToNextIndex =
    workflowRunIteratorSubStepIterationIndex <
    workflowRunIteratorSubStepIterationsCount - 1;

  const handleDecrementIndex = () => {
    if (!canGoToPreviousIndex) {
      return;
    }

    setWorkflowRunIteratorSubStepIterationIndex(
      workflowRunIteratorSubStepIterationIndex - 1,
    );
  };

  const handleIncrementIndex = () => {
    if (!canGoToNextIndex) {
      return;
    }

    setWorkflowRunIteratorSubStepIterationIndex(
      workflowRunIteratorSubStepIterationIndex + 1,
    );
  };

  if (!isDescendantOfIterator) {
    return null;
  }

  return (
    <StyledContainer>
      <IconButton
        Icon={IconChevronLeft}
        size="small"
        disabled={!canGoToPreviousIndex}
        onClick={handleDecrementIndex}
      />

      <StyledCounter>
        {workflowRunIteratorSubStepIterationIndex + 1}/
        {plural(workflowRunIteratorSubStepIterationsCount, {
          one: '# item',
          other: '# items',
        })}
      </StyledCounter>

      <IconButton
        Icon={IconChevronRight}
        size="small"
        disabled={!canGoToNextIndex}
        onClick={handleIncrementIndex}
      />
    </StyledContainer>
  );
};
