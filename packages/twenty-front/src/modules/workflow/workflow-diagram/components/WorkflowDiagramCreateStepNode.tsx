import styled from '@emotion/styled';
import { Position } from '@xyflow/react';
import { IconButton } from 'twenty-ui/input';
import { IconPlus } from 'twenty-ui/display';
import { WorkflowDiagramBaseHandle } from '@/workflow/workflow-diagram/components/WorkflowDiagramBaseHandle';
import { CREATE_STEP_NODE_WIDTH } from '@/workflow/workflow-diagram/constants/CreateStepNodeWidth';

const StyledContainer = styled.div`
  left: ${CREATE_STEP_NODE_WIDTH / 2}px;
  padding-top: ${({ theme }) => theme.spacing(3)};
  position: relative;
`;

export const WorkflowDiagramCreateStepNode = () => {
  return (
    <StyledContainer>
      <WorkflowDiagramBaseHandle type="target" position={Position.Top} />

      <IconButton Icon={IconPlus} size="medium" ariaLabel="Add a step" />
    </StyledContainer>
  );
};
