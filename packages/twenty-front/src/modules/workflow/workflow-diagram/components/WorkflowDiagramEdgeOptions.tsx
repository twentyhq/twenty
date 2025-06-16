import { WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramEdgeOptionsClickOutsideId';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import styled from '@emotion/styled';
import { EdgeLabelRenderer } from '@xyflow/react';
import { IconPlus } from 'twenty-ui/display';
import { IconButtonGroup } from 'twenty-ui/input';
import { useState } from 'react';

const StyledIconButtonGroup = styled(IconButtonGroup)`
  pointer-events: all;
`;

const StyledContainer = styled.div<{
  labelY?: number;
}>`
  position: absolute;
  transform: ${({ labelY }) => `translate(${21}px, ${(labelY || 0) - 14}px) `};
`;

const StyledHoverZone = styled.div`
  position: absolute;
  width: 48px;
  height: 52px;
  transform: translate(-13px, -16px);
  background: transparent;
`;

const StyledWrapper = styled.div`
  pointer-events: all;
  position: relative;
`;

type WorkflowDiagramEdgeOptionsProps = {
  labelX?: number;
  labelY?: number;
  parentStepId: string;
  nextStepId: string;
};

export const WorkflowDiagramEdgeOptions = ({
  labelY,
  parentStepId,
  nextStepId,
}: WorkflowDiagramEdgeOptionsProps) => {
  const [hovered, setHovered] = useState(false);

  const { startNodeCreation } = useStartNodeCreation();

  return (
    <EdgeLabelRenderer>
      <StyledContainer
        labelY={labelY}
        data-click-outside-id={WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID}
      >
        <StyledWrapper
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <StyledHoverZone />
          {hovered && (
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
          )}
        </StyledWrapper>
      </StyledContainer>
    </EdgeLabelRenderer>
  );
};
