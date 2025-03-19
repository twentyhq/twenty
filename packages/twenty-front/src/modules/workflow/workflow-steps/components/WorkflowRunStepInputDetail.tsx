import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import { useWorkflowRunIdOrThrow } from '@/workflow/hooks/useWorkflowRunIdOrThrow';
import { getWorkflowPreviousStepId } from '@/workflow/workflow-steps/utils/getWorkflowPreviousStep';
import { getWorkflowRunStepContext } from '@/workflow/workflow-steps/utils/getWorkflowRunStepContext';
import { getWorkflowVariablesUsedInStep } from '@/workflow/workflow-steps/utils/getWorkflowVariablesUsedInStep';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared';
import {
  IconBrackets,
  JsonNestedNode,
  JsonTreeContextProvider,
  ShouldExpandNodeInitiallyProps,
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

  const previousStepId = getWorkflowPreviousStepId({
    stepId,
    steps: workflowRun.output.flow.steps,
  });

  if (previousStepId === undefined) {
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

  const isFirstNodeDepthOfPreviousStep = ({
    keyPath,
    depth,
  }: ShouldExpandNodeInitiallyProps) =>
    keyPath.startsWith(previousStepId) && depth < 2;

  return (
    <StyledContainer>
      <JsonTreeContextProvider
        value={{
          emptyArrayLabel: t`Empty Array`,
          emptyObjectLabel: t`Empty Object`,
          emptyStringLabel: t`[empty string]`,
          arrowButtonCollapsedLabel: t`Expand`,
          arrowButtonExpandedLabel: t`Collapse`,
          shouldHighlightNode: (keyPath) => variablesUsedInStep.has(keyPath),
          shouldExpandNodeInitially: isFirstNodeDepthOfPreviousStep,
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
