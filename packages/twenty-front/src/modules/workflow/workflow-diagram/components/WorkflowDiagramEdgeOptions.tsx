import { EdgeLabelRenderer } from '@xyflow/react';
import { STEP_ICON_WIDTH } from '@/workflow/workflow-diagram/constants/CreateStepNodeWidth';
import styled from '@emotion/styled';
import { IconButtonGroup } from 'twenty-ui/input';
import { IconPlus } from 'twenty-ui/display';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import { isDefined } from 'twenty-shared/utils';

const EDGE_OPTION_BUTTON_LEFT_MARGIN = 8;

const StyledIconButtonGroup = styled(IconButtonGroup)`
  pointer-events: all;
`;

const StyledContainer = styled.div<{
  labelX?: number;
  labelY?: number;
}>`
  position: absolute;
  transform: ${({ labelX, labelY }) =>
    `translate(${labelX || 0}px, ${isDefined(labelY) ? labelY - STEP_ICON_WIDTH / 2 : 0}px) translateX(${EDGE_OPTION_BUTTON_LEFT_MARGIN}px)`};
`;

type WorkflowDiagramEdgeOptionsProps = {
  labelX?: number;
  labelY?: number;
  parentStepId: string;
  nextStepId: string;
};

export const WorkflowDiagramEdgeOptions = ({
  labelX,
  labelY,
  parentStepId,
  nextStepId,
}: WorkflowDiagramEdgeOptionsProps) => {
  const { startNodeCreation } = useStartNodeCreation();

  return (
    <EdgeLabelRenderer>
      <StyledContainer labelX={labelX} labelY={labelY}>
        <StyledIconButtonGroup
          className="nodrag nopan"
          iconButtons={[
            {
              Icon: IconPlus,
              onClick: () => {
                startNodeCreation({ parentStepId, nextStepId });
              },
            },
          ]}
        />
      </StyledContainer>
    </EdgeLabelRenderer>
  );
};
