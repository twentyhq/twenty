import { useListenRightDrawerClose } from '@/ui/layout/right-drawer/hooks/useListenRightDrawerClose';
import { WorkflowDiagramCanvasContainer } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasContainer';
import { WorkflowDiagramCanvasStatusTagContainer } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasStatusTagContainer';
import { WorkflowDiagramCustomMarkers } from '@/workflow/workflow-diagram/components/WorkflowDiagramCustomMarkers';
import { useRightDrawerState } from '@/workflow/workflow-diagram/hooks/useRightDrawerState';
import { workflowDiagramState } from '@/workflow/workflow-diagram/states/workflowDiagramState';
import { workflowReactFlowRefState } from '@/workflow/workflow-diagram/states/workflowReactFlowRefState';
import {
  WorkflowDiagramEdge,
  WorkflowDiagramEdgeType,
  WorkflowDiagramNode,
  WorkflowDiagramNodeType,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getOrganizedDiagram } from '@/workflow/workflow-diagram/utils/getOrganizedDiagram';
import { useTheme } from '@emotion/react';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import React, { useEffect, useMemo, useRef } from 'react';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { Tag, TagColor } from 'twenty-ui/components';
import { THEME_COMMON } from 'twenty-ui/theme';

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
}) => {
  const theme = useTheme();

  const reactflow = useReactFlow();

  const workflowDiagram = useRecoilValue(workflowDiagramState);

  const { nodes, edges } = useMemo(
    () =>
      isDefined(workflowDiagram)
        ? getOrganizedDiagram(workflowDiagram)
        : { nodes: [], edges: [] },
    [workflowDiagram],
  );

  const { rightDrawerState } = useRightDrawerState();

  const rightDrawerWidth = Number(
    THEME_COMMON.rightDrawerWidth.replace('px', ''),
  );

  const setWorkflowDiagram = useSetRecoilState(workflowDiagramState);

  const setWorkflowReactFlowRef = useRecoilCallback(
    ({ set }) =>
      (node: HTMLDivElement | null) => {
        set(workflowReactFlowRefState, { current: node });
      },
    [],
  );

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

  useListenRightDrawerClose(() => {
    reactflow.setNodes((nodes) =>
      nodes.map((node) => ({ ...node, selected: false })),
    );
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDefined(containerRef.current) || !reactflow.viewportInitialized) {
      return;
    }

    const currentViewport = reactflow.getViewport();

    const flowBounds = reactflow.getNodesBounds(reactflow.getNodes());

    let visibleRightDrawerWidth = 0;
    if (rightDrawerState === 'normal') {
      visibleRightDrawerWidth = rightDrawerWidth;
    }

    const viewportX =
      (containerRef.current.offsetWidth + visibleRightDrawerWidth) / 2 -
      flowBounds.width / 2;

    reactflow.setViewport(
      {
        ...currentViewport,
        x: viewportX - visibleRightDrawerWidth,
      },
      { duration: 300 },
    );
  }, [reactflow, rightDrawerState, rightDrawerWidth]);

  const handleNodesChanges = useRecoilCallback(
    ({ set }) =>
      (changes: NodeChange<WorkflowDiagramNode>[]) => {
        set(workflowDiagramState, (diagram) => {
          if (!isDefined(diagram)) {
            throw new Error(
              'It must be impossible for the nodes to be updated if the diagram is not defined yet. Be sure the diagram is rendered only when defined.',
            );
          }

          return {
            ...diagram,
            nodes: applyNodeChanges(changes, diagram.nodes),
          };
        });
      },
    [],
  );

  const handleInit = async () => {
    if (!isDefined(containerRef.current)) {
      return;
    }

    const flowBounds = reactflow.getNodesBounds(reactflow.getNodes());

    await reactflow.setViewport({
      x: containerRef.current.offsetWidth / 2 - flowBounds.width / 2,
      y: 150,
      zoom: defaultFitViewOptions.maxZoom,
    });

    onInit?.();
  };

  return (
    <WorkflowDiagramCanvasContainer ref={containerRef}>
      <WorkflowDiagramCustomMarkers />

      <ReactFlow
        ref={setWorkflowReactFlowRef}
        onInit={handleInit}
        minZoom={defaultFitViewOptions.minZoom}
        maxZoom={defaultFitViewOptions.maxZoom}
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
        edgesFocusable={false}
        nodesDraggable={false}
        nodesConnectable={false}
        paneClickDistance={10} // Fix small unwanted user dragging does not select node
        preventScrolling={false}
      >
        <Background color={theme.border.color.medium} size={2} />

        {children}
      </ReactFlow>

      <WorkflowDiagramCanvasStatusTagContainer data-testid={tagContainerTestId}>
        <Tag color={tagColor} text={tagText} />
      </WorkflowDiagramCanvasStatusTagContainer>
    </WorkflowDiagramCanvasContainer>
  );
};
