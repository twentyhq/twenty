import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { type CommandMenuAnimationVariant } from '@/command-menu/types/CommandMenuAnimationVariant';
import { useListenToSidePanelClosing } from '@/ui/layout/right-drawer/hooks/useListenToSidePanelClosing';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { WorkflowDiagramRightClickCommandMenu } from '@/workflow/workflow-diagram/components/WorkflowDiagramRightClickCommandMenu';
import { useRightDrawerState } from '@/workflow/workflow-diagram/hooks/useRightDrawerState';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { workflowDiagramPanOnDragComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramPanOnDragComponentState';
import { workflowDiagramWaitingNodesDimensionsComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramWaitingNodesDimensionsComponentState';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import {
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
import { useEdgeState } from '@/workflow/workflow-diagram/workflow-edges/hooks/useEdgeState';
import { type WorkflowDiagramEdgeComponentProps } from '@/workflow/workflow-diagram/workflow-edges/types/WorkflowDiagramEdgeComponentProps';
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
  type OnDelete,
  type OnNodeDrag,
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
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { Tag, type TagColor } from 'twenty-ui/components';
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
  const setWorkflowInsertStepIds = useSetRecoilComponentState(
    workflowInsertStepIdsComponentState,
  );
  const setWorkflowSelectedNode = useSetRecoilComponentState(
    workflowSelectedNodeComponentState,
  );
  const workflowDiagramWaitingNodesDimensionsState =
    useRecoilComponentCallbackState(
      workflowDiagramWaitingNodesDimensionsComponentState,
    );
  const setWorkflowDiagramWaitingNodesDimensions = useSetRecoilComponentState(
    workflowDiagramWaitingNodesDimensionsComponentState,
  );

  const { setEdgeHovered, clearEdgeHover } = useEdgeState();

  const [workflowDiagramFlowInitialized, setWorkflowDiagramFlowInitialized] =
    useState<boolean>(false);

  const { nodes, edges } = useMemo(() => {
    if (isDefined(workflowDiagram)) {
      return workflowDiagram;
    }
    return { nodes: [], edges: [] };
  }, [workflowDiagram]);

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
    reactflow.setEdges((edges) =>
      edges.map((edge) => ({ ...edge, selected: false })),
    );
    setWorkflowInsertStepIds({
      parentStepId: undefined,
      nextStepId: undefined,
      position: undefined,
    });
    setWorkflowSelectedNode(undefined);
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

  const handleConnect = (connection: Connection) => {
    assertWorkflowConnectionOrThrow(connection);

    onConnect?.(connection);
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
        onPaneContextMenu={onPaneContextMenu}
        nodesConnectable={nodesConnectable}
        paneClickDistance={10} // Fix small unwanted user dragging does not select node
        preventScrolling={false}
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
