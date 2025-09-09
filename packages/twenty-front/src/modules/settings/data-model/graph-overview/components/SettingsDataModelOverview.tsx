import { SettingsDataModelOverviewEffect } from '@/settings/data-model/graph-overview/components/SettingsDataModelOverviewEffect';
import { SettingsDataModelOverviewObject } from '@/settings/data-model/graph-overview/components/SettingsDataModelOverviewObject';
import { SettingsDataModelOverviewRelationMarkers } from '@/settings/data-model/graph-overview/components/SettingsDataModelOverviewRelationMarkers';
import { calculateHandlePosition } from '@/settings/data-model/graph-overview/utils/calculateHandlePosition';
import styled from '@emotion/styled';
import {
  Background,
  type Edge,
  type Node,
  type NodeTypes,
  type OnEdgesChange,
  type OnNodesChange,
  ReactFlow,
  applyEdgeChanges,
  applyNodeChanges,
  getIncomers,
  getOutgoers,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import { useCallback, useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  IconLock,
  IconLockOpen,
  IconMaximize,
  IconMinus,
  IconPlus,
  IconX,
} from 'twenty-ui/display';
import { Button, IconButtonGroup } from 'twenty-ui/input';

const nodeTypes: NodeTypes = {
  object: SettingsDataModelOverviewObject,
};
const StyledContainer = styled.div`
  height: 100%;
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
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const [nodes, setNodes] = useNodesState<Node>([]);
  const [edges, setEdges] = useEdgesState<Edge>([]);
  const [isInteractive, setInteractive] = useState(true);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );

  const handleNodesChange: OnNodesChange = useCallback(
    (nodeChanges) => {
      nodeChanges.forEach((nodeChange) => {
        const node = nodes.find(
          (node) => node.id === (nodeChange as { id: string }).id,
        );
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
                  const sourceHandle = `${edge.data?.sourceField}-${sourcePosition}`;
                  const targetHandle = `${edge.data?.targetField}-${targetPosition}`;
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

                  const sourceHandle = `${edge.data?.sourceField}-${sourcePosition}`;
                  const targetHandle = `${edge.data?.targetField}-${targetPosition}`;

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
        <Button
          Icon={IconX}
          to={getSettingsPath(SettingsPath.Objects)}
        ></Button>
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
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        nodesDraggable={isInteractive}
        elementsSelectable={isInteractive}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <IconButtonGroup
          className="react-flow__panel react-flow__controls bottom left horizontal"
          iconButtons={[
            {
              Icon: IconPlus,
              onClick: () => zoomIn(),
            },
            {
              Icon: IconMinus,
              onClick: () => zoomOut(),
            },
            {
              Icon: IconMaximize,
              onClick: () => fitView(),
            },
            {
              Icon: isInteractive ? IconLockOpen : IconLock,
              onClick: () => setInteractive(!isInteractive),
            },
          ]}
        ></IconButtonGroup>
      </ReactFlow>
    </StyledContainer>
  );
};
