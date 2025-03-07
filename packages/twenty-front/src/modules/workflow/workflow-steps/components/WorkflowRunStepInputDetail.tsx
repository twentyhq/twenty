import { JsonNestedNode } from '@/workflow/components/json-visualizer/components/JsonNestedNode';
import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import { useWorkflowRunIdOrThrow } from '@/workflow/hooks/useWorkflowRunIdOrThrow';
import { getWorkflowRunStepContext } from '@/workflow/workflow-steps/utils/getWorkflowRunStepContext';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared';
import { IconBrackets } from 'twenty-ui';

const StyledContainer = styled.div`
  padding-block: ${({ theme }) => theme.spacing(4)};
  padding-inline: ${({ theme }) => theme.spacing(3)};
`;

export const WorkflowRunStepInputDetail = ({ stepId }: { stepId: string }) => {
  const workflowRunId = useWorkflowRunIdOrThrow();
  const workflowRun = useWorkflowRun({ workflowRunId });

  if (
    !(
      isDefined(workflowRun) &&
      isDefined(workflowRun.context) &&
      isDefined(workflowRun.output?.flow)
    )
  ) {
    return null;
  }

  const stepContext = getWorkflowRunStepContext({
    context: workflowRun.context,
    flow: workflowRun.output.flow,
    stepId,
  });

  return (
    <StyledContainer>
      <JsonNestedNode
        elements={stepContext.map(({ id, name, context }) => ({
          id,
          label: name,
          value: context,
        }))}
        Icon={IconBrackets}
        depth={0}
      />
    </StyledContainer>
  );
};
