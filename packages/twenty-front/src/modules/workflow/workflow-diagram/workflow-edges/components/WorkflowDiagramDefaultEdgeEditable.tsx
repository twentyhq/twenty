import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { useOpenWorkflowEditFilterInCommandMenu } from '@/workflow/workflow-diagram/hooks/useOpenWorkflowEditFilterInCommandMenu';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import { WorkflowDiagramBaseEdge } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramBaseEdge';
import { WorkflowDiagramEdgeButtonGroup } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeButtonGroup';
import { WorkflowDiagramEdgeLabel } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeLabel';
import { WorkflowDiagramEdgeLabelContainer } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeLabelContainer';
import { WorkflowDiagramEdgeV2Container } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeV2Container';
import { WorkflowDiagramEdgeV2VisibilityContainer } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeV2VisibilityContainer';
import { WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/workflow-edges/constants/WorkflowDiagramEdgeOptionsClickOutsideId';
import { useEdgeState } from '@/workflow/workflow-diagram/workflow-edges/hooks/useEdgeState';
import { type WorkflowDiagramEdgeComponentProps } from '@/workflow/workflow-diagram/workflow-edges/types/WorkflowDiagramEdgeComponentProps';
import { useCreateStep } from '@/workflow/workflow-steps/hooks/useCreateStep';
import { useDeleteEdge } from '@/workflow/workflow-steps/hooks/useDeleteEdge';
import { useLingui } from '@lingui/react/macro';
import { EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import { type MouseEvent, useContext } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconFilter, IconPlus, IconTrash } from 'twenty-ui/display';

type WorkflowDiagramDefaultEdgeEditableProps =
  WorkflowDiagramEdgeComponentProps;

export const WorkflowDiagramDefaultEdgeEditable = ({
  source,
  sourceHandleId,
  target,
  targetHandleId,
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerStart,
  markerEnd,
  data,
}: WorkflowDiagramDefaultEdgeEditableProps) => {
  const { i18n } = useLingui();

  const { isInRightDrawer } = useContext(ActionMenuContext);

  const { isEdgeHovered } = useEdgeState();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const { createStep } = useCreateStep();

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

    await deleteEdge({
      source,
      sourceHandle: sourceHandleId,
      target,
      targetHandle: targetHandleId,
    });
  };

  return (
    <>
      <WorkflowDiagramBaseEdge
        source={source}
        sourceHandleId={sourceHandleId}
        target={target}
        targetHandleId={targetHandleId}
        path={edgePath}
        markerStart={markerStart}
        markerEnd={markerEnd}
      />

      <EdgeLabelRenderer>
        {isDefined(data?.labelOptions) && (
          <WorkflowDiagramEdgeLabelContainer
            sourceX={sourceX}
            sourceY={sourceY}
            position={data.labelOptions.position}
          >
            <WorkflowDiagramEdgeLabel label={i18n._(data.labelOptions.label)} />
          </WorkflowDiagramEdgeLabelContainer>
        )}

        <WorkflowDiagramEdgeV2Container
          data-click-outside-id={WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID}
          labelX={labelX}
          labelY={labelY}
        >
          <WorkflowDiagramEdgeV2VisibilityContainer
            shouldDisplay={
              nodeCreationStarted ||
              isEdgeHovered({
                source,
                target,
                sourceHandle: sourceHandleId,
                targetHandle: targetHandleId,
              })
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
                {
                  Icon: IconTrash,
                  onClick: handleDeleteBranch,
                },
              ]}
              selected={nodeCreationStarted}
            />
          </WorkflowDiagramEdgeV2VisibilityContainer>
        </WorkflowDiagramEdgeV2Container>
      </EdgeLabelRenderer>
    </>
  );
};
