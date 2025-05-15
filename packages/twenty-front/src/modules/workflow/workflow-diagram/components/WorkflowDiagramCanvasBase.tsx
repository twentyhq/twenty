import { useListenRightDrawerClose } from '@/ui/layout/right-drawer/hooks/useListenRightDrawerClose';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { WorkflowDiagramCustomMarkers } from '@/workflow/workflow-diagram/components/WorkflowDiagramCustomMarkers';
import { useRightDrawerState } from '@/workflow/workflow-diagram/hooks/useRightDrawerState';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import {
  WorkflowDiagramEdge,
  WorkflowDiagramEdgeType,
  WorkflowDiagramNode,
  WorkflowDiagramNodeType,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getOrganizedDiagram } from '@/workflow/workflow-diagram/utils/getOrganizedDiagram';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import React, { useEffect, useMemo, useRef } from 'react';
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

  const workflowDiagram = useRecoilComponentValueV2(
    workflowDiagramComponentState,
  );

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

  const setWorkflowDiagram = useSetRecoilComponentStateV2(
    workflowDiagramComponentState,
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

  const handleNodesChanges = (changes: NodeChange<WorkflowDiagramNode>[]) => {
    setWorkflowDiagram((diagram) => {
      if (!isDefined(diagram)) {
        return diagram;
      }

      return {
        ...diagram,
        nodes: applyNodeChanges(changes, diagram.nodes),
      };
    });
  };

  const handleInit = () => {
    if (!isDefined(containerRef.current)) {
      return;
    }

    const flowBounds = reactflow.getNodesBounds(reactflow.getNodes());

    reactflow.setViewport({
      x: containerRef.current.offsetWidth / 2 - flowBounds.width / 2,
      y: 150,
      zoom: defaultFitViewOptions.maxZoom,
    });

    onInit?.();
  };

  return (
    <StyledResetReactflowStyles ref={containerRef}>
      <WorkflowDiagramCustomMarkers />

      <ReactFlow
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

      <StyledStatusTagContainer data-testid={tagContainerTestId}>
        <Tag color={tagColor} text={tagText} />
      </StyledStatusTagContainer>
    </StyledResetReactflowStyles>
  );
};
