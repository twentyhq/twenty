import { WorkflowDiagramBaseHandle } from '@/workflow/workflow-diagram/components/WorkflowDiagramBaseHandle';
import { CREATE_STEP_NODE_WIDTH } from '@/workflow/workflow-diagram/constants/CreateStepNodeWidth';
import { WORKFLOW_DIAGRAM_CREATE_STEP_NODE_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramCreateStepNodeClickOutsideId';
import styled from '@emotion/styled';
import { Position } from '@xyflow/react';
import { IconPlus } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

const StyledContainer = styled.div`
  left: ${CREATE_STEP_NODE_WIDTH / 2}px;
  padding-top: ${({ theme }) => theme.spacing(3)};
  position: relative;
`;

export const WorkflowDiagramCreateStepNode = () => {
  return (
    <StyledContainer
      data-click-outside-id={WORKFLOW_DIAGRAM_CREATE_STEP_NODE_CLICK_OUTSIDE_ID}
    >
      <WorkflowDiagramBaseHandle type="target" position={Position.Top} />

      <IconButton Icon={IconPlus} size="medium" ariaLabel="Add a step" />
    </StyledContainer>
  );
};
