import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import { useWorkflowRunIdOrThrow } from '@/workflow/hooks/useWorkflowRunIdOrThrow';
import { getWorkflowRunStepContext } from '@/workflow/workflow-steps/utils/getWorkflowRunStepContext';
import { getWorkflowVariablesUsedInStep } from '@/workflow/workflow-steps/utils/getWorkflowVariablesUsedInStep';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared';
import {
  IconBrackets,
  JsonNestedNode,
  JsonTreeContextProvider,
} from 'twenty-ui';

const StyledContainer = styled.div`
  display: grid;
  overflow-x: auto;
  padding-block: ${({ theme }) => theme.spacing(4)};
  padding-inline: ${({ theme }) => theme.spacing(3)};
`;

export const WorkflowRunStepInputDetail = ({ stepId }: { stepId: string }) => {
  const { t } = useLingui();

  const workflowRunId = useWorkflowRunIdOrThrow();
  const workflowRun = useWorkflowRun({ workflowRunId });
  const step = workflowRun?.output?.flow.steps.find(
    (step) => step.id === stepId,
  );

  if (
    !(
      isDefined(workflowRun) &&
      isDefined(workflowRun.context) &&
      isDefined(workflowRun.output?.flow) &&
      isDefined(step)
    )
  ) {
    return null;
  }

  const variablesUsedInStep = getWorkflowVariablesUsedInStep({
    step,
  });

  const stepContext = getWorkflowRunStepContext({
    context: workflowRun.context,
    flow: workflowRun.output.flow,
    stepId,
  });

  if (stepContext.length === 0) {
    throw new Error('The input tab must be rendered with a non-empty context.');
  }

  return (
    <StyledContainer>
      <JsonTreeContextProvider
        value={{
          emptyArrayLabel: t`Empty Array`,
          emptyObjectLabel: t`Empty Object`,
          arrowButtonCollapsedLabel: t`Expand`,
          arrowButtonExpandedLabel: t`Collapse`,
          shouldHighlightNode: (keyPath) => variablesUsedInStep.has(keyPath),
        }}
      >
        <JsonNestedNode
          elements={stepContext.map(({ id, name, context }) => ({
            id,
            label: name,
            value: context,
          }))}
          Icon={IconBrackets}
          depth={0}
          keyPath=""
          emptyElementsText=""
        />
      </JsonTreeContextProvider>
    </StyledContainer>
  );
};
