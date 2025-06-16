import { STEP_ICON_WIDTH } from '@/workflow/workflow-diagram/constants/CreateStepNodeWidth';
import { WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramEdgeOptionsClickOutsideId';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import styled from '@emotion/styled';
import { EdgeLabelRenderer } from '@xyflow/react';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/display';
import { IconButtonGroup } from 'twenty-ui/input';

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
      <StyledContainer
        labelX={labelX}
        labelY={labelY}
        data-click-outside-id={WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID}
      >
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
