import styled from '@emotion/styled';
import { IconPlus } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { WorkflowDiagramConnector } from '@/workflow/workflow-diagram/components/WorkflowDiagramConnector';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import React from 'react';
import { WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { VERTICAL_DISTANCE_BETWEEN_TWO_NODES } from '@/workflow/workflow-diagram/constants/VerticalDistanceBetweenTwoNodes';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const StyledVerticalLineContainer = styled.div`
  display: flex;
  height: 56px;
  justify-content: center;
  width: 560px;
`;

type WorkflowDiagramCreateStepElementProps = {
  data: WorkflowDiagramStepNodeData;
};

export const WorkflowDiagramCreateStepElement = ({
  data,
}: WorkflowDiagramCreateStepElementProps) => {
  const { startNodeCreation } = useStartNodeCreation();

  const addNode = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    startNodeCreation({
      parentStepId: data.stepId,
      nextStepId: undefined,
      position: {
        x: data.position.x,
        y: data.position.y + VERTICAL_DISTANCE_BETWEEN_TWO_NODES,
      },
    });
  };

  return (
    <StyledContainer>
      <StyledVerticalLineContainer>
        <WorkflowDiagramConnector />
      </StyledVerticalLineContainer>
      <IconButton
        Icon={IconPlus}
        size="small"
        ariaLabel="Add a step"
        onClick={addNode}
      />
    </StyledContainer>
  );
};
