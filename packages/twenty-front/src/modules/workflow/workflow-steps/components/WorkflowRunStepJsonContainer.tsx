import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { styled } from '@linaria/react';

const StyledWorkflowRunStepJsonContainer = styled(WorkflowStepBody)`
  grid-template-rows: max-content;
  gap: 0;
  display: grid;
  overflow: auto;
`;

export { StyledWorkflowRunStepJsonContainer as WorkflowRunStepJsonContainer };
