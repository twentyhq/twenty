import { useCallback } from 'react';
import ReactFlow, {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  EdgeChange,
  getIncomers,
  getOutgoers,
  NodeChange,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import styled from '@emotion/styled';
import { IconX } from 'twenty-ui';

import { SettingsDataModelOverviewEffect } from '@/settings/data-model/graph-overview/components/SettingsDataModelOverviewEffect';
import { SettingsDataModelOverviewObject } from '@/settings/data-model/graph-overview/components/SettingsDataModelOverviewObject';
import { SettingsDataModelOverviewRelationMarkers } from '@/settings/data-model/graph-overview/components/SettingsDataModelOverviewRelationMarkers';
import { calculateHandlePosition } from '@/settings/data-model/graph-overview/util/calculateHandlePosition';
import { Button } from '@/ui/input/button/components/Button';
import { isDefined } from '~/utils/isDefined';

import 'reactflow/dist/style.css';

const NodeTypes = {
  object: SettingsDataModelOverviewObject,
};
const StyledContainer = styled.div`
  height: 100%;
  .has-many-edge {
    &.selected path.react-flow__edge-path {
      marker-end: url(#hasManySelected);
      stroke-width: 1.5;
    }
  }
  .has-many-edge--highlighted {
    path.react-flow__edge-path,
    path.react-flow__edge-interaction,
    path.react-flow__connection-path {
      stroke: ${({ theme }) => theme.tag.background.blue} !important;
      stroke-width: 1.5px;
    }
  }
  .has-many-edge-reversed {
    &.selected path.react-flow__edge-path {
      marker-end: url(#hasManyReversedSelected);
      stroke-width: 1.5;
    }
  }
  .has-many-edge-reversed--highlighted {
    path.react-flow__edge-path,
    path.react-flow__edge-interaction,
    path.react-flow__connection-path {
      stroke: ${({ theme }) => theme.tag.background.blue} !important;
      stroke-width: 1.5px;
    }
  }
  .react-flow__handle {
    border: 0 !important;
    background: transparent !important;
    width: 6px;
    height: 6px;
    min-height: 6px;
    min-width: 6px;
    pointer-events: none;
  }
  .left-handle {
    left: 0;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
  }
  .right-handle {
    right: 0;
    top: 50%;
    transform: translateX(50%) translateY(-50%);
  }
  .top-handle {
    top: 0;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
  }
  .bottom-handle {
    bottom: 0;
    left: 50%;
    transform: translateX(-50%) translateY(50%);
  }
  .react-flow__panel {
    display: flex;
    border-radius: ${({ theme }) => theme.border.radius.md};
    box-shadow: unset;

    button {
      background: ${({ theme }) => theme.background.secondary};
      border-bottom: none;
      fill: ${({ theme }) => theme.font.color.secondary};
    }
  }
  .react-flow__node {
    z-index: -1 !important;
  }
`;

const StyledCloseButton = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing(3)};
  left: ${({ theme }) => theme.spacing(3)};
  z-index: 5;
`;

export const SettingsDataModelOverview = () => {
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );

  const handleNodesChange = useCallback(
    (nodeChanges: any[]) => {
      nodeChanges.forEach((nodeChange) => {
        const node = nodes.find((node) => node.id === nodeChange.id);
        if (!node) {
          return;
        }

        const incomingNodes = getIncomers(node, nodes, edges);
        const newXPos =
          'positionAbsolute' in nodeChange
            ? nodeChange.positionAbsolute?.x
            : node.position.x || 0;

        incomingNodes.forEach((incomingNode) => {
          const edge = edges.find((edge) => {
            return edge.target === node.id && edge.source === incomingNode.id;
          });

          if (isDefined(newXPos)) {
            setEdges((eds) =>
              eds.map((ed) => {
                if (isDefined(edge) && ed.id === edge.id) {
                  const sourcePosition = calculateHandlePosition(
                    incomingNode.width as number,
                    incomingNode.position.x,
                    node.width as number,
                    newXPos,
                    'source',
                  );
                  const targetPosition = calculateHandlePosition(
                    incomingNode.width as number,
                    incomingNode.position.x,
                    node.width as number,
                    newXPos,
                    'target',
                  );
                  const sourceHandle = `${edge.data.sourceField}-${sourcePosition}`;
                  const targetHandle = `${edge.data.targetField}-${targetPosition}`;
                  ed.sourceHandle = sourceHandle;
                  ed.targetHandle = targetHandle;
                  ed.markerEnd = 'marker';
                  ed.markerStart = 'marker';
                }

                return ed;
              }),
            );
          }
        });

        const outgoingNodes = getOutgoers(node, nodes, edges);
        outgoingNodes.forEach((targetNode) => {
          const edge = edges.find((edge) => {
            return edge.target === targetNode.id && edge.source === node.id;
          });
          if (isDefined(newXPos)) {
            setEdges((eds) =>
              eds.map((ed) => {
                if (isDefined(edge) && ed.id === edge.id) {
                  const sourcePosition = calculateHandlePosition(
                    node.width as number,
                    newXPos,
                    targetNode.width as number,
                    targetNode.position.x,
                    'source',
                  );
                  const targetPosition = calculateHandlePosition(
                    node.width as number,
                    newXPos,
                    targetNode.width as number,
                    targetNode.position.x,
                    'target',
                  );

                  const sourceHandle = `${edge.data.sourceField}-${sourcePosition}`;
                  const targetHandle = `${edge.data.targetField}-${targetPosition}`;

                  ed.sourceHandle = sourceHandle;
                  ed.targetHandle = targetHandle;
                  ed.markerEnd = 'marker';
                  ed.markerStart = 'marker';
                }

                return ed;
              }),
            );
          }
        });
      });

      onNodesChange(nodeChanges);
    },
    [onNodesChange, setEdges, nodes, edges],
  );

  return (
    <StyledContainer>
      <StyledCloseButton>
        <Button Icon={IconX} to="/settings/objects"></Button>
      </StyledCloseButton>
      <SettingsDataModelOverviewEffect
        setEdges={setEdges}
        setNodes={setNodes}
      />
      <SettingsDataModelOverviewRelationMarkers />
      <ReactFlow
        fitView
        nodes={nodes}
        edges={edges}
        onEdgesChange={onEdgesChange}
        nodeTypes={NodeTypes}
        onNodesChange={handleNodesChange}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </StyledContainer>
  );
};
