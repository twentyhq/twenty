import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { commandMenuWidthState } from '@/command-menu/states/commandMenuWidthState';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { useListenToSidePanelClosing } from '@/ui/layout/right-drawer/hooks/useListenToSidePanelClosing';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { WorkflowDiagramRightClickCommandMenu } from '@/workflow/workflow-diagram/components/WorkflowDiagramRightClickCommandMenu';
import { WORKFLOW_DIAGRAM_EMPTY_NODE_DEFINITION } from '@/workflow/workflow-diagram/constants/WorkflowDiagramEmptyNodeDefinition';
import { useResetWorkflowInsertStepIds } from '@/workflow/workflow-diagram/hooks/useResetWorkflowInsertStepIds';
import { useWorkflowDiagramScreenToFlowPosition } from '@/workflow/workflow-diagram/hooks/useWorkflowDiagramScreenToFlowPosition';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { workflowDiagramPanOnDragComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramPanOnDragComponentState';
import { workflowDiagramWaitingNodesDimensionsComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramWaitingNodesDimensionsComponentState';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import {
  type StartNodeCreationParams,
  type WorkflowConnection,
  type WorkflowDiagram,
  type WorkflowDiagramEdge,
  type WorkflowDiagramEdgeType,
  type WorkflowDiagramNode,
  type WorkflowDiagramNodeType,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { assertWorkflowConnectionOrThrow } from '@/workflow/workflow-diagram/utils/assertWorkflowConnectionOrThrow';
import { WorkflowDiagramConnection } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramConnection';
import { WorkflowDiagramCustomMarkers } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramCustomMarkers';
import { EDGE_BRANCH_ARROW_MARKER } from '@/workflow/workflow-diagram/workflow-edges/constants/EdgeBranchArrowMarker';
import { useEdgeState } from '@/workflow/workflow-diagram/workflow-edges/hooks/useEdgeState';
import { type WorkflowDiagramEdgeComponentProps } from '@/workflow/workflow-diagram/workflow-edges/types/WorkflowDiagramEdgeComponentProps';
import { getConnectionOptionsForSourceHandle } from '@/workflow/workflow-diagram/workflow-edges/utils/getConnectionOptionsForSourceHandle';
import { WORKFLOW_DIAGRAM_NODE_DEFAULT_SOURCE_HANDLE_ID } from '@/workflow/workflow-diagram/workflow-nodes/constants/WorkflowDiagramNodeDefaultSourceHandleId';
import { WORKFLOW_DIAGRAM_NODE_DEFAULT_TARGET_HANDLE_ID } from '@/workflow/workflow-diagram/workflow-nodes/constants/WorkflowDiagramNodeDefaultTargetHandleId';
import { workflowInsertStepIdsComponentState } from '@/workflow/workflow-steps/states/workflowInsertStepIdsComponentState';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  Background,
  ReactFlow,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
  type Connection,
  type EdgeChange,
  type FitViewOptions,
  type NodeChange,
  type NodeProps,
  type OnBeforeDelete,
  type OnConnectStartParams,
  type OnDelete,
  type OnNodeDrag,
  type OnReconnect,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { Tag, type TagColor } from 'twenty-ui/components';

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
  onDeleteEdge,
  onNodeDragStop,
  onReconnect,
  onReconnectStart,
  onReconnectEnd,
  startNodeCreation,
  handlePaneContextMenu,
  nodesConnectable = false,
  nodesDraggable = false,
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
        WorkflowDiagramEdgeComponentProps & {
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
  onConnect?: (params: WorkflowConnection) => void;
  onDeleteEdge?: (edge: WorkflowDiagramEdge) => void;
  onNodeDragStop?: OnNodeDrag<WorkflowDiagramNode>;
  onReconnect?: OnReconnect;
  onReconnectStart?: () => void;
  onReconnectEnd?: () => void;
  startNodeCreation?: (params: StartNodeCreationParams) => void;
  nodesConnectable?: boolean;
  nodesDraggable?: boolean;
  handlePaneContextMenu?: ({
    x,
    y,
    event,
  }: {
    x: number;
    y: number;
    event: MouseEvent | React.MouseEvent<Element, MouseEvent>;
  }) => void;
}) => {
  const theme = useTheme();

  const reactflow = useReactFlow();

  const workflowDiagram = useRecoilComponentValue(
    workflowDiagramComponentState,
  );
  const workflowDiagramPanOnDrag = useRecoilComponentValue(
    workflowDiagramPanOnDragComponentState,
  );
  const workflowDiagramState = useRecoilComponentCallbackState(
    workflowDiagramComponentState,
  );
  const setWorkflowDiagram = useSetRecoilComponentState(
    workflowDiagramComponentState,
  );
  const setWorkflowSelectedNode = useSetRecoilComponentState(
    workflowSelectedNodeComponentState,
  );
  const { resetWorkflowInsertStepIds } = useResetWorkflowInsertStepIds();
  const workflowDiagramWaitingNodesDimensionsState =
    useRecoilComponentCallbackState(
      workflowDiagramWaitingNodesDimensionsComponentState,
    );
  const setWorkflowDiagramWaitingNodesDimensions = useSetRecoilComponentState(
    workflowDiagramWaitingNodesDimensionsComponentState,
  );

  const workflowInsertStepIds = useRecoilComponentValue(
    workflowInsertStepIdsComponentState,
  );

  const { workflowDiagramScreenToFlowPosition } =
    useWorkflowDiagramScreenToFlowPosition();

  const { setEdgeHovered, clearEdgeHover } = useEdgeState();

  const [workflowDiagramFlowInitialized, setWorkflowDiagramFlowInitialized] =
    useState<boolean>(false);

  const [connectionStartInfo, setConnectionStartInfo] = useState<{
    nodeId: string;
    handleId: string;
  } | null>(null);

  const { nodes, edges } = useMemo(() => {
    if (!isDefined(workflowDiagram)) {
      return { nodes: [], edges: [] };
    }

    const nodes = [...workflowDiagram.nodes];
    const edges = [...workflowDiagram.edges];

    if (
      isDefined(workflowInsertStepIds.position) &&
      !isDefined(workflowInsertStepIds.nextStepId)
    ) {
      const emptyNode = {
        ...WORKFLOW_DIAGRAM_EMPTY_NODE_DEFINITION,
        position: workflowInsertStepIds.position,
        data: {
          ...WORKFLOW_DIAGRAM_EMPTY_NODE_DEFINITION.data,
          position: workflowInsertStepIds.position,
        },
      };

      nodes.push(emptyNode);

      if (isDefined(workflowInsertStepIds.parentStepId)) {
        edges.push({
          id: 'empty-edge',
          type: 'blank',
          source: workflowInsertStepIds.parentStepId,
          sourceHandle: WORKFLOW_DIAGRAM_NODE_DEFAULT_SOURCE_HANDLE_ID,
          target: WORKFLOW_DIAGRAM_EMPTY_NODE_DEFINITION.id,
          targetHandle: WORKFLOW_DIAGRAM_NODE_DEFAULT_TARGET_HANDLE_ID,
          markerStart: undefined,
          ...EDGE_BRANCH_ARROW_MARKER.Default,
          deletable: false,
          selectable: false,
          data: {
            edgeType: 'default',
          },
        });
      }
    }

    return { nodes, edges };
  }, [workflowDiagram, workflowInsertStepIds]);

  const isCommandMenuOpened = useRecoilValue(isCommandMenuOpenedState);
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
    resetWorkflowInsertStepIds();
    setWorkflowSelectedNode(undefined);
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const setFlowViewport = useRecoilCallback(
    ({ snapshot }) =>
      ({
        workflowDiagramFlowInitialized,
        isCommandMenuOpened,
        workflowDiagram,
        isInRightDrawer,
      }: {
        workflowDiagramFlowInitialized: boolean;
        isCommandMenuOpened: boolean;
        workflowDiagram: WorkflowDiagram | undefined;
        isInRightDrawer: boolean;
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

        const baseContainerWidth = containerRef.current.offsetWidth;
        const hasViewportBeenMoved = currentViewport.x !== 0;

        let adjustedContainerWidth = baseContainerWidth;

        const commandMenuWidth = getSnapshotValue(
          snapshot,
          commandMenuWidthState,
        );

        if (!isInRightDrawer && isCommandMenuOpened) {
          adjustedContainerWidth = baseContainerWidth - commandMenuWidth;
        } else if (!isInRightDrawer && hasViewportBeenMoved) {
          adjustedContainerWidth = baseContainerWidth + commandMenuWidth;
        }

        const flowBounds = reactflow.getNodesBounds(nodes);
        const centeredXPosition =
          adjustedContainerWidth / 2 - flowBounds.width / 2;

        reactflow.setViewport(
          {
            ...currentViewport,
            x: centeredXPosition,
            zoom: defaultFitViewOptions.maxZoom,
          },
          { duration: hasViewportBeenMoved ? 300 : 0 },
        );
      },
    [reactflow, setWorkflowDiagramWaitingNodesDimensions],
  );

  const handleSetFlowViewportOnChange = useRecoilCallback(
    ({ snapshot }) =>
      ({
        workflowDiagramFlowInitialized,
        isCommandMenuOpened,
        isInRightDrawer,
      }: {
        workflowDiagramFlowInitialized: boolean;
        isCommandMenuOpened: boolean;
        isInRightDrawer: boolean;
      }) => {
        setFlowViewport({
          isInRightDrawer,
          isCommandMenuOpened,
          workflowDiagramFlowInitialized,
          workflowDiagram: getSnapshotValue(snapshot, workflowDiagramState),
        });
      },
    [setFlowViewport, workflowDiagramState],
  );

  useEffect(() => {
    handleSetFlowViewportOnChange({
      workflowDiagramFlowInitialized,
      isCommandMenuOpened,
      isInRightDrawer,
    });
  }, [
    handleSetFlowViewportOnChange,
    isCommandMenuOpened,
    workflowDiagramFlowInitialized,
    isInRightDrawer,
  ]);

  const handleNodesChanges = useRecoilCallback(
    ({ snapshot, set }) =>
      (changes: NodeChange<WorkflowDiagramNode>[]) => {
        const workflowDiagram = getSnapshotValue(
          snapshot,
          workflowDiagramState,
        );

        const filteredChanges = changes.filter(
          (change) =>
            !(
              'id' in change &&
              change.id === WORKFLOW_DIAGRAM_EMPTY_NODE_DEFINITION.id
            ),
        );

        let updatedWorkflowDiagram = workflowDiagram;
        if (isDefined(workflowDiagram) && filteredChanges.length > 0) {
          updatedWorkflowDiagram = {
            ...workflowDiagram,
            nodes: applyNodeChanges(filteredChanges, workflowDiagram.nodes),
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
          isCommandMenuOpened,
          workflowDiagramFlowInitialized,
          workflowDiagram: updatedWorkflowDiagram,
          isInRightDrawer,
        });
      },
    [
      isCommandMenuOpened,
      setFlowViewport,
      workflowDiagramFlowInitialized,
      workflowDiagramState,
      workflowDiagramWaitingNodesDimensionsState,
      isInRightDrawer,
    ],
  );

  const handleInit = () => {
    if (!isDefined(containerRef.current)) {
      return;
    }

    setWorkflowDiagramFlowInitialized(true);

    onInit?.();
  };

  const onBeforeDelete: OnBeforeDelete<
    WorkflowDiagramNode,
    WorkflowDiagramEdge
  > = async ({ nodes, edges }) => {
    if (nodes.length === 0 && edges.length > 0) {
      return true;
    }

    return false;
  };

  const onDelete: OnDelete<WorkflowDiagramNode, WorkflowDiagramEdge> = async ({
    edges,
  }) => {
    if (!isDefined(onDeleteEdge)) {
      return;
    }

    for (const edge of edges) {
      onDeleteEdge(edge);
    }
  };

  const onPaneContextMenu = useCallback(
    (event: MouseEvent | React.MouseEvent<Element, MouseEvent>) => {
      event.preventDefault();

      const bounds = containerRef.current?.getBoundingClientRect();
      if (!bounds) return;

      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;

      handlePaneContextMenu?.({ x, y, event });
    },
    [handlePaneContextMenu],
  );

  const onEdgeMouseEnter = useCallback(
    (
      _: React.MouseEvent<Element, MouseEvent>,
      hoveredEdge: WorkflowDiagramEdge,
    ) => {
      setEdgeHovered({
        source: hoveredEdge.source,
        target: hoveredEdge.target,
        sourceHandle: hoveredEdge.sourceHandle,
        targetHandle: hoveredEdge.targetHandle,
      });
    },
    [setEdgeHovered],
  );

  const onEdgeMouseLeave = useCallback(() => {
    clearEdgeHover();
  }, [clearEdgeHover]);

  const handleConnectStart = (
    _: MouseEvent | TouchEvent,
    params: OnConnectStartParams,
  ) => {
    if (isDefined(params.nodeId) && isDefined(params.handleId)) {
      setConnectionStartInfo({
        nodeId: params.nodeId,
        handleId: params.handleId,
      });
    }
  };

  const handleConnect = (connection: Connection) => {
    assertWorkflowConnectionOrThrow(connection);
    setConnectionStartInfo(null);
    onConnect?.(connection);
  };

  const handleConnectEnd = (event: MouseEvent | TouchEvent) => {
    let startInfo = connectionStartInfo;

    setConnectionStartInfo((prev) => {
      startInfo = prev;
      return null;
    });

    if (
      !isDefined(startInfo) ||
      !isDefined(startNodeCreation) ||
      !(event instanceof MouseEvent) ||
      !isDefined(containerRef.current)
    ) {
      return;
    }

    const bounds = containerRef.current.getBoundingClientRect();

    const screenPosition = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    };

    const flowPosition = workflowDiagramScreenToFlowPosition(screenPosition);

    if (!isDefined(flowPosition)) {
      return;
    }

    const DEFAULT_NODE_WIDTH = 200;
    const adjustedPosition = {
      x: flowPosition.x - DEFAULT_NODE_WIDTH / 2,
      y: flowPosition.y + 50,
    };

    startNodeCreation({
      parentStepId: startInfo.nodeId,
      nextStepId: undefined,
      position: adjustedPosition,
      connectionOptions: getConnectionOptionsForSourceHandle({
        sourceHandleId: startInfo.handleId,
      }),
    });
  };

  return (
    <StyledResetReactflowStyles ref={containerRef}>
      <WorkflowDiagramCustomMarkers />

      <ReactFlow
        onInit={handleInit}
        minZoom={defaultFitViewOptions.minZoom}
        maxZoom={defaultFitViewOptions.maxZoom}
        defaultViewport={{ x: 0, y: 150, zoom: defaultFitViewOptions.maxZoom }}
        nodeTypes={nodeTypes}
        // @ts-expect-error We override Reactflow types for sourceHandle and targetHandle to be required
        edgeTypes={edgeTypes}
        nodes={nodes}
        edges={edges}
        onEdgeMouseEnter={onEdgeMouseEnter}
        onEdgeMouseLeave={onEdgeMouseLeave}
        onNodesChange={handleNodesChanges}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onConnectStart={handleConnectStart}
        onConnectEnd={handleConnectEnd}
        onReconnect={onReconnect}
        onReconnectStart={onReconnectStart}
        onReconnectEnd={onReconnectEnd}
        onNodeDragStop={onNodeDragStop}
        onBeforeDelete={onBeforeDelete}
        onDelete={onDelete}
        selectNodesOnDrag={false}
        proOptions={{ hideAttribution: true }}
        multiSelectionKeyCode={null}
        nodesFocusable={false}
        nodesDraggable={nodesDraggable}
        edgesFocusable={isDefined(onDeleteEdge)}
        panOnDrag={workflowDiagramPanOnDrag}
        panOnScroll={true}
        onPaneContextMenu={onPaneContextMenu}
        nodesConnectable={nodesConnectable}
        paneClickDistance={10} // Fix small unwanted user dragging does not select node
        preventScrolling={true}
        connectionLineComponent={WorkflowDiagramConnection}
        connectionRadius={0}
      >
        <Background color={theme.border.color.medium} size={2} />

        {children}
      </ReactFlow>

      {isDefined(handlePaneContextMenu) && (
        <WorkflowDiagramRightClickCommandMenu />
      )}

      <StyledStatusTagContainer data-testid={tagContainerTestId}>
        <Tag color={tagColor} text={tagText} />
      </StyledStatusTagContainer>
    </StyledResetReactflowStyles>
  );
};
