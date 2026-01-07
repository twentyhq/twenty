import { WorkflowDiagramConnector } from '@/workflow/workflow-diagram/components/WorkflowDiagramConnector';
import { VERTICAL_DISTANCE_BETWEEN_TWO_NODES } from '@/workflow/workflow-diagram/constants/VerticalDistanceBetweenTwoNodes';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import { type WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { IconPlus } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const StyledVerticalLineContainer = styled.div`
  display: flex;
  height: 56px;
  justify-content: center;
  width: 56px;
`;

const StyledLabelContainer = styled.div`
  position: absolute;
  top: 14px;
`;

type WorkflowDiagramCreateStepElementProps = {
  data: WorkflowDiagramStepNodeData;
  Label?: React.ReactNode;
};

export const WorkflowDiagramCreateStepElement = ({
  data,
  Label,
}: WorkflowDiagramCreateStepElementProps) => {
  const { startNodeCreation } = useStartNodeCreation();

  const addNode = () => {
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

      {Label && <StyledLabelContainer>{Label}</StyledLabelContainer>}

      <IconButton
        Icon={IconPlus}
        size="small"
        ariaLabel={t`Add a step`}
        onClick={addNode}
      />
    </StyledContainer>
  );
};
