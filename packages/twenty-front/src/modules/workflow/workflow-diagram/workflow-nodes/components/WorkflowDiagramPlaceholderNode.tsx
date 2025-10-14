import { WorkflowDiagramHandleTarget } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramHandleTarget';
import { WorkflowNodeContainer } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeContainer';
import { WorkflowNodeIconContainer } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeIconContainer';
import { WorkflowNodeLabelWithCounterPart } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeLabelWithCounterPart';
import { WorkflowNodeRightPart } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeRightPart';
import { WorkflowNodeLabel } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeLabel';
import { WorkflowNodeTitle } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeTitle';
import { useLingui } from '@lingui/react/macro';

export const WorkflowDiagramPlaceholderNode = () => {
  const { t } = useLingui();

  return (
    <WorkflowNodeContainer isConnectable={false}>
      <WorkflowDiagramHandleTarget />
      <WorkflowNodeIconContainer />
      <WorkflowNodeRightPart>
        <WorkflowNodeLabelWithCounterPart>
          <WorkflowNodeLabel>{t`Action`}</WorkflowNodeLabel>
        </WorkflowNodeLabelWithCounterPart>
        <WorkflowNodeTitle>{t`Add an action`}</WorkflowNodeTitle>
      </WorkflowNodeRightPart>
    </WorkflowNodeContainer>
  );
};
