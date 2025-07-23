import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { CommandMenuAnimationVariant } from '@/command-menu/types/CommandMenuAnimationVariant';
import { useListenToSidePanelClosing } from '@/ui/layout/right-drawer/hooks/useListenToSidePanelClosing';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { WorkflowDiagramCustomMarkers } from '@/workflow/workflow-diagram/components/WorkflowDiagramCustomMarkers';
import { useRightDrawerState } from '@/workflow/workflow-diagram/hooks/useRightDrawerState';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { workflowDiagramPanOnDragComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramPanOnDragComponentState';
import { workflowDiagramWaitingNodesDimensionsComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramWaitingNodesDimensionsComponentState';
import {
  WorkflowDiagram,
  WorkflowDiagramEdge,
  WorkflowDiagramEdgeType,
  WorkflowDiagramNode,
  WorkflowDiagramNodeType,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { workflowInsertStepIdsComponentState } from '@/workflow/workflow-steps/states/workflowInsertStepIdsComponentState';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  Background,
  EdgeChange,
  EdgeProps,
  FitViewOptions,
  NodeChange,
  NodeProps,
  ReactFlow,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
  Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { Tag, TagColor } from 'twenty-ui/components';
import { THEME_COMMON } from 'twenty-ui/theme';

const StyledResetReactflowStyles = styled.div`
  height: 100%;
  width: 100%;
  position: relative;

  /* Below we reset the default styling of Reactflow */
  .react-flow__node-input,
  .react-flow__node-default,
  .react-flow__node-output,
  .react-flow__node-group {
    padding: 0;
    width: auto;
    text-align: start;
    white-space: nowrap;
  }

  .react-flow__handle {
    min-height: 0;
    min-width: 0;
  }
  .react-flow__handle-top {
    transform: translate(-50%, -50%);
  }
  .react-flow__handle-bottom {
    transform: translate(-50%, 100%);
  }
  .react-flow__handle.connectionindicator {
    cursor: pointer;
  }

  --xy-node-border-radius: none;
  --xy-node-border: none;
  --xy-node-background-color: none;
  --xy-node-boxshadow-hover: none;
  --xy-node-boxshadow-selected: none;
`;

const StyledStatusTagContainer = styled.div`
  left: 0;
  top: 0;
  position: absolute;
  padding: ${({ theme }) => theme.spacing(4)};
`;

const defaultFitViewOptions = {
  minZoom: 1,
  maxZoom: 1,
} satisfies FitViewOptions;

export const WorkflowDiagramCanvasBase = ({
  nodeTypes,
  edgeTypes,
  children,
  tagContainerTestId,
  tagColor,
  tagText,
  onInit,
  onConnect,
}: {
  nodeTypes: Partial<
    Record<
      WorkflowDiagramNodeType,
      React.ComponentType<
        NodeProps & {
          data: any;
          type: any;
        }
      >
    >
  >;
  edgeTypes: Partial<
    Record<
      WorkflowDiagramEdgeType,
      React.ComponentType<
        EdgeProps & {
          data: any;
          type: any;
        }
      >
    >
  >;
  children?: React.ReactNode;
  tagContainerTestId: string;
  tagColor: TagColor;
  tagText: string;
  onInit?: () => void;
  onConnect?: (params: Connection) => void;
}) => {
  const theme = useTheme();

  const reactflow = useReactFlow();

  const workflowDiagram = useRecoilComponentValueV2(
    workflowDiagramComponentState,
  );
  const workflowDiagramPanOnDrag = useRecoilComponentValueV2(
    workflowDiagramPanOnDragComponentState,
  );
  const workflowDiagramState = useRecoilComponentCallbackStateV2(
    workflowDiagramComponentState,
  );
  const setWorkflowDiagram = useSetRecoilComponentStateV2(
    workflowDiagramComponentState,
  );
  const setWorkflowInsertStepIds = useSetRecoilComponentStateV2(
    workflowInsertStepIdsComponentState,
  );
  const workflowDiagramWaitingNodesDimensionsState =
    useRecoilComponentCallbackStateV2(
      workflowDiagramWaitingNodesDimensionsComponentState,
    );
  const setWorkflowDiagramWaitingNodesDimensions = useSetRecoilComponentStateV2(
    workflowDiagramWaitingNodesDimensionsComponentState,
  );

  const [workflowDiagramFlowInitialized, setWorkflowDiagramFlowInitialized] =
    useState<boolean>(false);

  const { nodes, edges } = useMemo(
    () =>
      isDefined(workflowDiagram) ? workflowDiagram : { nodes: [], edges: [] },
    [workflowDiagram],
  );

  const { rightDrawerState } = useRightDrawerState();
  const { isInRightDrawer } = useContext(ActionMenuContext);

  const handleEdgesChange = (
    edgeChanges: Array<EdgeChange<WorkflowDiagramEdge>>,
  ) => {
    setWorkflowDiagram((diagram) => {
      if (isDefined(diagram) === false) {
        throw new Error(
          'It must be impossible for the edges to be updated if the diagram is not defined yet. Be sure the diagram is rendered only when defined.',
        );
      }

      return {
        ...diagram,
        edges: applyEdgeChanges(edgeChanges, diagram.edges),
      };
    });
  };

  useListenToSidePanelClosing(() => {
    reactflow.setNodes((nodes) =>
      nodes.map((node) => ({ ...node, selected: false })),
    );
    setWorkflowInsertStepIds({
      parentStepId: undefined,
      nextStepId: undefined,
    });
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const setFlowViewport = useRecoilCallback(
    () =>
      ({
        rightDrawerState,
        noAnimation,
        workflowDiagramFlowInitialized,
        isInRightDrawer,
        workflowDiagram,
      }: {
        rightDrawerState: CommandMenuAnimationVariant;
        noAnimation?: boolean;
        workflowDiagramFlowInitialized: boolean;
        isInRightDrawer: boolean;
        workflowDiagram: WorkflowDiagram | undefined;
      }) => {
        if (
          !isDefined(containerRef.current) ||
          !workflowDiagramFlowInitialized
        ) {
          return;
        }

        const currentViewport = reactflow.getViewport();
        const nodes = workflowDiagram?.nodes ?? [];

        const canComputeNodesBounds = nodes.every((node) =>
          isDefined(node.measured),
        );

        if (!canComputeNodesBounds) {
          setWorkflowDiagramWaitingNodesDimensions(true);
          return;
        }

        setWorkflowDiagramWaitingNodesDimensions(false);

        let visibleRightDrawerWidth = 0;
        if (rightDrawerState === 'normal' && !isInRightDrawer) {
          const rightDrawerWidth = Number(
            THEME_COMMON.rightDrawerWidth.replace('px', ''),
          );

          visibleRightDrawerWidth = rightDrawerWidth;
        }

        const flowBounds = reactflow.getNodesBounds(nodes);
        const viewportX =
          (containerRef.current.offsetWidth + visibleRightDrawerWidth) / 2 -
          flowBounds.width / 2;

        reactflow.setViewport(
          {
            ...currentViewport,
            x: viewportX - visibleRightDrawerWidth,
            zoom: defaultFitViewOptions.maxZoom,
          },
          { duration: noAnimation ? 0 : 300 },
        );
      },
    [reactflow, setWorkflowDiagramWaitingNodesDimensions],
  );

  const handleSetFlowViewportOnChange = useRecoilCallback(
    ({ snapshot }) =>
      ({
        rightDrawerState,
        workflowDiagramFlowInitialized,
        isInRightDrawer,
      }: {
        rightDrawerState: CommandMenuAnimationVariant;
        workflowDiagramFlowInitialized: boolean;
        isInRightDrawer: boolean;
      }) => {
        setFlowViewport({
          rightDrawerState,
          isInRightDrawer,
          workflowDiagramFlowInitialized,
          workflowDiagram: getSnapshotValue(snapshot, workflowDiagramState),
        });
      },
    [setFlowViewport, workflowDiagramState],
  );

  useEffect(() => {
    handleSetFlowViewportOnChange({
      rightDrawerState,
      workflowDiagramFlowInitialized,
      isInRightDrawer,
    });
  }, [
    handleSetFlowViewportOnChange,
    isInRightDrawer,
    rightDrawerState,
    workflowDiagramFlowInitialized,
  ]);

  const handleNodesChanges = useRecoilCallback(
    ({ snapshot, set }) =>
      (changes: NodeChange<WorkflowDiagramNode>[]) => {
        const workflowDiagram = getSnapshotValue(
          snapshot,
          workflowDiagramState,
        );
        let updatedWorkflowDiagram = workflowDiagram;
        if (isDefined(workflowDiagram)) {
          updatedWorkflowDiagram = {
            ...workflowDiagram,
            nodes: applyNodeChanges(changes, workflowDiagram.nodes),
          };
        }

        set(workflowDiagramState, updatedWorkflowDiagram);

        const workflowDiagramWaitingNodesDimensions = getSnapshotValue(
          snapshot,
          workflowDiagramWaitingNodesDimensionsState,
        );
        if (!workflowDiagramWaitingNodesDimensions) {
          return;
        }

        setFlowViewport({
          rightDrawerState,
          noAnimation: true,
          isInRightDrawer,
          workflowDiagramFlowInitialized,
          workflowDiagram: updatedWorkflowDiagram,
        });
      },
    [
      isInRightDrawer,
      rightDrawerState,
      setFlowViewport,
      workflowDiagramFlowInitialized,
      workflowDiagramState,
      workflowDiagramWaitingNodesDimensionsState,
    ],
  );

  const handleInit = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        if (!isDefined(containerRef.current)) {
          return;
        }

        setFlowViewport({
          rightDrawerState,
          noAnimation: true,
          isInRightDrawer,
          workflowDiagramFlowInitialized: true,
          workflowDiagram: getSnapshotValue(snapshot, workflowDiagramState),
        });

        setWorkflowDiagramFlowInitialized(true);

        onInit?.();
      },
    [
      isInRightDrawer,
      onInit,
      rightDrawerState,
      setFlowViewport,
      workflowDiagramState,
    ],
  );

  return (
    <StyledResetReactflowStyles ref={containerRef}>
      <WorkflowDiagramCustomMarkers />

      <ReactFlow
        onInit={handleInit}
        minZoom={defaultFitViewOptions.minZoom}
        maxZoom={defaultFitViewOptions.maxZoom}
        defaultViewport={{ x: 0, y: 150, zoom: defaultFitViewOptions.maxZoom }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChanges}
        onEdgesChange={handleEdgesChange}
        onBeforeDelete={async () => {
          // Abort all non-programmatic deletions
          return false;
        }}
        proOptions={{ hideAttribution: true }}
        multiSelectionKeyCode={null}
        nodesFocusable={false}
        edgesFocusable={true}
        panOnDrag={workflowDiagramPanOnDrag}
        nodesConnectable={true}
        paneClickDistance={10} // Fix small unwanted user dragging does not select node
        preventScrolling={false}
        onConnect={onConnect}
      >
        <Background color={theme.border.color.medium} size={2} />

        {children}
      </ReactFlow>

      <StyledStatusTagContainer data-testid={tagContainerTestId}>
        <Tag color={tagColor} text={tagText} />
      </StyledStatusTagContainer>
    </StyledResetReactflowStyles>
  );
};
