import { isRightDrawerMinimizedState } from '@/ui/layout/right-drawer/states/isRightDrawerMinimizedState';
import { isRightDrawerOpenState } from '@/ui/layout/right-drawer/states/isRightDrawerOpenState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { WorkflowVersionStatusTag } from '@/workflow/components/WorkflowVersionStatusTag';
import { workflowDiagramState } from '@/workflow/states/workflowDiagramState';
import { WorkflowVersionStatus } from '@/workflow/types/Workflow';
import {
  WorkflowDiagram,
  WorkflowDiagramEdge,
  WorkflowDiagramNode,
  WorkflowDiagramNodeType,
} from '@/workflow/types/WorkflowDiagram';
import { getOrganizedDiagram } from '@/workflow/utils/getOrganizedDiagram';
import styled from '@emotion/styled';
import {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  EdgeChange,
  FitViewOptions,
  getNodesBounds,
  NodeChange,
  NodeProps,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import React, { useEffect, useMemo, useRef } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { GRAY_SCALE, isDefined, THEME_COMMON } from 'twenty-ui';
import { useListenRightDrawerClose } from '@/ui/layout/right-drawer/hooks/useListenRightDrawerClose';
import { workflowReactFlowRefState } from '@/workflow/states/workflowReactFlowRefState';

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
  padding: ${({ theme }) => theme.spacing(2)};
`;

const defaultFitViewOptions = {
  minZoom: 1,
  maxZoom: 1,
} satisfies FitViewOptions;

export const WorkflowDiagramCanvasBase = ({
  diagram,
  status,
  nodeTypes,
  children,
}: {
  diagram: WorkflowDiagram;
  status: WorkflowVersionStatus;
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
  children?: React.ReactNode;
}) => {
  const reactflow = useReactFlow();
  const setWorkflowReactFlowRefState = useSetRecoilState(
    workflowReactFlowRefState,
  );

  const { nodes, edges } = useMemo(
    () => getOrganizedDiagram(diagram),
    [diagram],
  );

  const isRightDrawerOpen = useRecoilValue(isRightDrawerOpenState);
  const isRightDrawerMinimized = useRecoilValue(isRightDrawerMinimizedState);
  const isMobile = useIsMobile();

  const rightDrawerState = !isRightDrawerOpen
    ? 'closed'
    : isRightDrawerMinimized
      ? 'minimized'
      : isMobile
        ? 'fullScreen'
        : 'normal';

  const rightDrawerWidth = Number(
    THEME_COMMON.rightDrawerWidth.replace('px', ''),
  );

  const setWorkflowDiagram = useSetRecoilState(workflowDiagramState);

  const handleNodesChange = (
    nodeChanges: Array<NodeChange<WorkflowDiagramNode>>,
  ) => {
    setWorkflowDiagram((diagram) => {
      if (isDefined(diagram) === false) {
        throw new Error(
          'It must be impossible for the nodes to be updated if the diagram is not defined yet. Be sure the diagram is rendered only when defined.',
        );
      }

      return {
        ...diagram,
        nodes: applyNodeChanges(nodeChanges, diagram.nodes),
      };
    });
  };

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

    const flowBounds = getNodesBounds(reactflow.getNodes());

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

  return (
    <StyledResetReactflowStyles ref={containerRef}>
      <ReactFlow
        ref={(node) => {
          if (isDefined(node)) {
            setWorkflowReactFlowRefState({ current: node });
          }
        }}
        onInit={() => {
          if (!isDefined(containerRef.current)) {
            throw new Error('Expect the container ref to be defined');
          }

          const flowBounds = getNodesBounds(reactflow.getNodes());

          reactflow.setViewport({
            x: containerRef.current.offsetWidth / 2 - flowBounds.width / 2,
            y: 150,
            zoom: defaultFitViewOptions.maxZoom,
          });
        }}
        minZoom={defaultFitViewOptions.minZoom}
        maxZoom={defaultFitViewOptions.maxZoom}
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        proOptions={{ hideAttribution: true }}
        multiSelectionKeyCode={null}
        nodesFocusable={false}
        edgesFocusable={false}
        nodesDraggable={false}
        paneClickDistance={10} // Fix small unwanted user dragging does not select node
      >
        <Background color={GRAY_SCALE.gray25} size={2} />

        {children}
      </ReactFlow>

      <StyledStatusTagContainer>
        <WorkflowVersionStatusTag versionStatus={status} />
      </StyledStatusTagContainer>
    </StyledResetReactflowStyles>
  );
};
