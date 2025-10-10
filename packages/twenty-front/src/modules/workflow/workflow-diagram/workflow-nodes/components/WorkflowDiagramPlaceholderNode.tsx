import { WorkflowDiagramHandleTarget } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramHandleTarget';
import { WorkflowNodeContainer } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeContainer';
import { WorkflowNodeIconContainer } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeIconContainer';
import { WorkflowNodeLabel } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeLabel';
import { WorkflowNodeLabelWithCounterPart } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeLabelWithCounterPart';
import { WorkflowNodeRightPart } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeRightPart';
import { WorkflowNodeTitle } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeTitle';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';

const StyledPlaceholderLabel = styled(WorkflowNodeLabel)``;

const StyledPlaceholderTitle = styled(WorkflowNodeTitle)``;

export const WorkflowDiagramPlaceholderNode = () => {
  const { t } = useLingui();

  return (
    <WorkflowNodeContainer isConnectable={false}>
      <WorkflowDiagramHandleTarget />
      <WorkflowNodeIconContainer />
      <WorkflowNodeRightPart>
        <WorkflowNodeLabelWithCounterPart>
          <StyledPlaceholderLabel>{t`Action`}</StyledPlaceholderLabel>
        </WorkflowNodeLabelWithCounterPart>
        <StyledPlaceholderTitle>{t`Add an action`}</StyledPlaceholderTitle>
      </WorkflowNodeRightPart>
    </WorkflowNodeContainer>
  );
};
