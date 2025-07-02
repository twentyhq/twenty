import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramEdgeOptionsClickOutsideId';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import { workflowInsertStepIdsComponentState } from '@/workflow/workflow-steps/states/workflowInsertStepIdsComponentState';
import styled from '@emotion/styled';
import { useState } from 'react';
import { IconPlus } from 'twenty-ui/display';
import { IconButtonGroup } from 'twenty-ui/input';

const StyledIconButtonGroup = styled(IconButtonGroup)`
  pointer-events: all;
`;

const StyledContainer = styled.div<{
  labelY?: number;
}>`
  position: absolute;
  transform: ${({ labelY }) => `translate(${21}px, ${(labelY || 0) - 14}px)`};
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

type WorkflowDiagramEdgeV1Props = {
  labelY?: number;
  parentStepId: string;
  nextStepId: string;
};

export const WorkflowDiagramEdgeV1 = ({
  labelY,
  parentStepId,
  nextStepId,
}: WorkflowDiagramEdgeV1Props) => {
  const [hovered, setHovered] = useState(false);

  const { startNodeCreation } = useStartNodeCreation();

  const workflowInsertStepIds = useRecoilComponentValueV2(
    workflowInsertStepIdsComponentState,
  );

  const isSelected =
    workflowInsertStepIds.parentStepId === parentStepId &&
    workflowInsertStepIds.nextStepId === nextStepId;

  return (
    <StyledContainer
      labelY={labelY}
      data-click-outside-id={WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID}
    >
      <StyledWrapper
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <StyledHoverZone />
        {(hovered || isSelected) && (
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
  );
};
