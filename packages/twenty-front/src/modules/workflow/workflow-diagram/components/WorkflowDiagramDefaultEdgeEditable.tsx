import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { WorkflowDiagramBaseEdge } from '@/workflow/workflow-diagram/components/WorkflowDiagramBaseEdge';
import { WorkflowDiagramEdgeButtonGroup } from '@/workflow/workflow-diagram/components/WorkflowDiagramEdgeButtonGroup';
import { WorkflowDiagramEdgeV2Container } from '@/workflow/workflow-diagram/components/WorkflowDiagramEdgeV2Container';
import { WorkflowDiagramEdgeV2VisibilityContainer } from '@/workflow/workflow-diagram/components/WorkflowDiagramEdgeV2VisibilityContainer';
import { WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramEdgeOptionsClickOutsideId';
import { useEdgeHovered } from '@/workflow/workflow-diagram/hooks/useEdgeHovered';
import { useOpenWorkflowEditFilterInCommandMenu } from '@/workflow/workflow-diagram/hooks/useOpenWorkflowEditFilterInCommandMenu';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import { WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { useCreateStep } from '@/workflow/workflow-steps/hooks/useCreateStep';
import { EdgeLabelRenderer, EdgeProps, getBezierPath } from '@xyflow/react';
import { useContext } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconFilter, IconPlus } from 'twenty-ui/display';

type WorkflowDiagramDefaultEdgeEditableProps = EdgeProps<WorkflowDiagramEdge>;

export const WorkflowDiagramDefaultEdgeEditable = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerStart,
  markerEnd,
}: WorkflowDiagramDefaultEdgeEditableProps) => {
  const { isInRightDrawer } = useContext(ActionMenuContext);

  const { isEdgeHovered } = useEdgeHovered();

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
        <WorkflowDiagramEdgeV2Container
          data-click-outside-id={WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID}
          labelX={labelX}
          labelY={labelY}
        >
          <WorkflowDiagramEdgeV2VisibilityContainer
            shouldDisplay={nodeCreationStarted || isEdgeHovered(id)}
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
              ]}
              selected={nodeCreationStarted}
            />
          </WorkflowDiagramEdgeV2VisibilityContainer>
        </WorkflowDiagramEdgeV2Container>
      </EdgeLabelRenderer>
    </>
  );
};
