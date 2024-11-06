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
import { useTheme } from '@emotion/react';
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
  Viewport,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { GRAY_SCALE, isDefined } from 'twenty-ui';

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
  const theme = useTheme();
  const reactflow = useReactFlow();

  const { nodes, edges } = useMemo(
    () => getOrganizedDiagram(diagram),
    [diagram],
  );

  const isRightDrawerOpen = useRecoilValue(isRightDrawerOpenState);
  const isRightDrawerMinimized = useRecoilValue(isRightDrawerMinimizedState);
  const isMobile = useIsMobile();

  const rightDrawerState = useMemo(() => {
    return !isRightDrawerOpen
      ? 'closed'
      : isRightDrawerMinimized
        ? 'minimized'
        : isMobile
          ? 'fullScreen'
          : 'normal';
  }, [isMobile, isRightDrawerMinimized, isRightDrawerOpen]);

  const rightDrawerWidth = theme.rightDrawerWidth;

  const containerWidth = useMemo(() => {
    if (
      rightDrawerState === 'closed' ||
      rightDrawerState === 'fullScreen' ||
      rightDrawerState === 'minimized'
    ) {
      return 'auto';
    }

    return `calc(100% - ${rightDrawerWidth})`;
  }, [rightDrawerState, rightDrawerWidth]);

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

  const containerRef = useRef<HTMLDivElement>(null);

  const [viewport, setViewport] = useState<Viewport>({
    x: 0,
    y: 0,
    zoom: defaultFitViewOptions.maxZoom,
  });

  useLayoutEffect(() => {
    if (!isDefined(containerRef.current)) {
      return;
    }

    const observer = new ResizeObserver(() => {
      setViewport((viewport) => {
        if (!isDefined(containerRef.current)) {
          return viewport;
        }

        const rect = getNodesBounds(reactflow.getNodes());

        return {
          ...viewport,
          x: containerRef.current.offsetWidth / 2 - rect.width / 2,
        };
      });
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [reactflow]);

  return (
    <StyledResetReactflowStyles
      ref={containerRef}
      style={{ width: containerWidth }}
    >
      <ReactFlow
        viewport={viewport}
        onViewportChange={setViewport}
        onInit={() => {
          if (!isDefined(containerRef.current)) {
            throw new Error('Expect the container ref to be defined');
          }

          const rect = getNodesBounds(reactflow.getNodes());

          setViewport({
            x: containerRef.current.offsetWidth / 2 - rect.width / 2,
            y: 150,
            zoom: defaultFitViewOptions.maxZoom,
          });
        }}
        minZoom={defaultFitViewOptions.minZoom}
        maxZoom={defaultFitViewOptions.maxZoom}
        nodeTypes={nodeTypes}
        nodes={nodes.map((node) => ({ ...node, draggable: false }))}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        proOptions={{ hideAttribution: true }}
      >
        <Background color={GRAY_SCALE.gray25} size={2} />

        {children}

        <StyledStatusTagContainer>
          <WorkflowVersionStatusTag versionStatus={status} />
        </StyledStatusTagContainer>
      </ReactFlow>
    </StyledResetReactflowStyles>
  );
};
