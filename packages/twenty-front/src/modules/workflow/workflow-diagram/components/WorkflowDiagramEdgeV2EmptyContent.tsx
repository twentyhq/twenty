import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { WorkflowDiagramEdgeV2Container } from '@/workflow/workflow-diagram/components/WorkflowDiagramEdgeV2Container';
import { WorkflowDiagramEdgeV2VisibilityContainer } from '@/workflow/workflow-diagram/components/WorkflowDiagramEdgeV2VisibilityContainer';
import { WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramEdgeOptionsClickOutsideId';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { workflowInsertStepIdsComponentState } from '@/workflow/workflow-steps/states/workflowInsertStepIdsComponentState';
import styled from '@emotion/styled';
import { useState } from 'react';
import { IconFilter, IconPlus } from 'twenty-ui/display';
import { IconButtonGroup } from 'twenty-ui/input';

const StyledIconButtonGroup = styled(IconButtonGroup)`
  pointer-events: all;
`;

type WorkflowDiagramEdgeV2EmptyContentProps = {
  labelX: number;
  labelY: number;
  parentStepId: string;
  nextStepId: string;
  onCreateFilter: () => Promise<void>;
  onCreateNode: () => void;
};

export const WorkflowDiagramEdgeV2EmptyContent = ({
  labelX,
  labelY,
  parentStepId,
  nextStepId,
  onCreateFilter,
  onCreateNode,
}: WorkflowDiagramEdgeV2EmptyContentProps) => {
  const [hovered, setHovered] = useState(false);

  const workflowInsertStepIds = useRecoilComponentValueV2(
    workflowInsertStepIdsComponentState,
  );

  const isSelected =
    workflowInsertStepIds.nextStepId === nextStepId &&
    workflowInsertStepIds.parentStepId === parentStepId;

  const handleCreateFilter = async () => {
    await onCreateFilter();

    setHovered(false);
  };

  const setWorkflowSelectedNode = useSetRecoilComponentStateV2(
    workflowSelectedNodeComponentState,
  );

  const handleFilterButtonClick = () => {
    setWorkflowSelectedNode(parentStepId);

    handleCreateFilter();
  };

  return (
    <WorkflowDiagramEdgeV2Container
      data-click-outside-id={WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID}
      labelX={labelX}
      labelY={labelY}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <WorkflowDiagramEdgeV2VisibilityContainer
        shouldDisplay={isSelected || hovered}
      >
        <StyledIconButtonGroup
          className="nodrag nopan"
          iconButtons={[
            {
              Icon: IconFilter,
              onClick: handleFilterButtonClick,
            },
            {
              Icon: IconPlus,
              onClick: onCreateNode,
            },
          ]}
        />
      </WorkflowDiagramEdgeV2VisibilityContainer>
    </WorkflowDiagramEdgeV2Container>
  );
};
