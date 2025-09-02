import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { useOpenWorkflowEditFilterInCommandMenu } from '@/workflow/workflow-diagram/hooks/useOpenWorkflowEditFilterInCommandMenu';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import { type WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { WorkflowDiagramBaseEdge } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramBaseEdge';
import { WorkflowDiagramEdgeButtonGroup } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeButtonGroup';
import { WorkflowDiagramEdgeLabel } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeLabel';
import { WorkflowDiagramEdgeV2Container } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeV2Container';
import { WorkflowDiagramEdgeV2VisibilityContainer } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeV2VisibilityContainer';
import { WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/workflow-edges/constants/WorkflowDiagramEdgeOptionsClickOutsideId';
import { useEdgeState } from '@/workflow/workflow-diagram/workflow-edges/hooks/useEdgeState';
import { useCreateStep } from '@/workflow/workflow-steps/hooks/useCreateStep';
import { useDeleteEdge } from '@/workflow/workflow-steps/hooks/useDeleteEdge';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import {
  EdgeLabelRenderer,
  type EdgeProps,
  getBezierPath,
} from '@xyflow/react';
import { type MouseEvent, useContext } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconFilter, IconPlus, IconTrash } from 'twenty-ui/display';
import { FeatureFlagKey } from '~/generated/graphql';

type WorkflowDiagramIteratorCompletedEmptyTriggerEdgeEditableProps =
  EdgeProps<WorkflowDiagramEdge>;

const StyledTopLabelContainer = styled.div<{
  sourceX: number;
  sourceY: number;
}>`
  position: absolute;
  transform: translate(-50%, 0%)
    translate(
      ${({ sourceX, sourceY }) => `${sourceX}px, ${Math.floor(sourceY)}px`}
    )
    translateY(10px);
  width: fit-content;
`;

export const WorkflowDiagramIteratorCompletedEmptyTriggerEdgeEditable = ({
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerStart,
  markerEnd,
}: WorkflowDiagramIteratorCompletedEmptyTriggerEdgeEditableProps) => {
  const isWorkflowBranchEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_BRANCH_ENABLED,
  );

  const { isInRightDrawer } = useContext(ActionMenuContext);

  const { isEdgeHovered } = useEdgeState();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const workflowVisualizerWorkflowId = useRecoilComponentValue(
    workflowVisualizerWorkflowIdComponentState,
  );
  const workflow = useWorkflowWithCurrentVersion(workflowVisualizerWorkflowId);

  const { createStep } = useCreateStep({ workflow });

  const { deleteEdge } = useDeleteEdge();

  const { startNodeCreation, isNodeCreationStarted } = useStartNodeCreation();

  const nodeCreationStarted = isNodeCreationStarted({
    parentStepId: source,
    nextStepId: target,
  });

  const setCommandMenuNavigationStack = useSetRecoilState(
    commandMenuNavigationStackState,
  );

  const { openWorkflowEditFilterInCommandMenu } =
    useOpenWorkflowEditFilterInCommandMenu();

  const handleCreateFilter = async () => {
    const createdStep = await createStep({
      newStepType: 'FILTER',
      parentStepId: source,
      nextStepId: target,
    });

    if (!isDefined(createdStep)) {
      return;
    }

    if (!isInRightDrawer) {
      setCommandMenuNavigationStack([]);
    }

    openWorkflowEditFilterInCommandMenu({
      stepId: createdStep.id,
      stepName: createdStep.name,
    });
  };

  const handleNodeButtonClick = () => {
    startNodeCreation({
      parentStepId: source,
      nextStepId: target,
      position: { x: labelX, y: labelY },
    });
  };

  const handleDeleteBranch = async (event: MouseEvent) => {
    event.stopPropagation();

    await deleteEdge({ source, target });
  };

  return (
    <>
      <WorkflowDiagramBaseEdge
        source={source}
        target={target}
        path={edgePath}
        markerStart={markerStart}
        markerEnd={markerEnd}
      />

      <EdgeLabelRenderer>
        <StyledTopLabelContainer sourceX={sourceX} sourceY={sourceY}>
          <WorkflowDiagramEdgeLabel label={t`completed`} />
        </StyledTopLabelContainer>

        <WorkflowDiagramEdgeV2Container
          data-click-outside-id={WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID}
          labelX={labelX}
          labelY={labelY}
        >
          <WorkflowDiagramEdgeV2VisibilityContainer
            shouldDisplay={
              nodeCreationStarted || isEdgeHovered({ source, target })
            }
          >
            <WorkflowDiagramEdgeButtonGroup
              iconButtons={[
                {
                  Icon: IconFilter,
                  onClick: handleCreateFilter,
                },
                {
                  Icon: IconPlus,
                  onClick: handleNodeButtonClick,
                },
                ...(isWorkflowBranchEnabled
                  ? [
                      {
                        Icon: IconTrash,
                        onClick: handleDeleteBranch,
                      },
                    ]
                  : []),
              ]}
              selected={nodeCreationStarted}
            />
          </WorkflowDiagramEdgeV2VisibilityContainer>
        </WorkflowDiagramEdgeV2Container>
      </EdgeLabelRenderer>
    </>
  );
};
