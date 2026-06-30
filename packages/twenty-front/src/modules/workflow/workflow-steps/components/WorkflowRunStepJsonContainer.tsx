import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';

const WorkflowRunStepJsonContainerInner = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <WorkflowStepBody
    display="grid"
    gridTemplateRows="max-content"
    rowGap="0"
    overflow="auto"
  >
    {children}
  </WorkflowStepBody>
);

export { WorkflowRunStepJsonContainerInner as WorkflowRunStepJsonContainer };
