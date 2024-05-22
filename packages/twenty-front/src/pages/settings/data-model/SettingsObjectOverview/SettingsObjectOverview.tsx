import { useCallback, useEffect } from 'react';
import ReactFlow, {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  Edge,
  EdgeChange,
  getIncomers,
  getOutgoers,
  NodeChange,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import dagre from '@dagrejs/dagre';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { IconSettings, IconX } from 'twenty-ui';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import {
  calculateSourcePosition,
  calculateTargetPosition,
} from '~/pages/settings/data-model/SettingsObjectOverview/EdgeUtil';
import { Markers } from '~/pages/settings/data-model/SettingsObjectOverview/Markers';
import { ObjectNode } from '~/pages/settings/data-model/SettingsObjectOverview/ObjectNode';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

import 'reactflow/dist/style.css';

const NodeTypes = {
  object: ObjectNode,
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

export const SettingsObjectOverview = () => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const theme = useTheme();
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
                  const sourcePosition = calculateSourcePosition(
                    incomingNode.width as number,
                    incomingNode.position.x,
                    node.width as number,
                    newXPos,
                  );
                  const targetPosition = calculateTargetPosition(
                    incomingNode.width as number,
                    incomingNode.position.x,
                    node.width as number,
                    newXPos,
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
                  const sourcePosition = calculateSourcePosition(
                    node.width as number,
                    newXPos,
                    targetNode.width as number,
                    targetNode.position.x,
                  );
                  const targetPosition = calculateTargetPosition(
                    node.width as number,
                    newXPos,
                    targetNode.width as number,
                    targetNode.position.x,
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

  useEffect(() => {
    const items = objectMetadataItems.filter((x) => !x.isSystem);

    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: 'LR' });
    g.setDefaultEdgeLabel(() => ({}));

    const edges: Edge[] = [];
    const nodes = [];
    let i = 0;
    for (const object of items) {
      nodes.push({
        id: object.namePlural,
        width: 220,
        height: 100,
        position: { x: i * 300, y: 0 },
        data: object,
        type: 'object',
      });
      g.setNode(object.namePlural, { width: 220, height: 100 });

      for (const field of object.fields) {
        if (
          isDefined(field.toRelationMetadata) &&
          isDefined(
            items.find(
              (x) => x.id === field.toRelationMetadata?.fromObjectMetadata.id,
            ),
          )
        ) {
          const sourceObj =
            field.relationDefinition?.sourceObjectMetadata.namePlural;
          const targetObj =
            field.relationDefinition?.targetObjectMetadata.namePlural;

          edges.push({
            id: `${sourceObj}-${targetObj}`,
            source: object.namePlural,
            sourceHandle: `${field.id}-right`,
            target: field.toRelationMetadata.fromObjectMetadata.namePlural,
            targetHandle: `${field.toRelationMetadata.fromFieldMetadataId}-left`,
            type: 'smoothstep',
            style: {
              strokeWidth: 1,
              stroke: theme.color.gray,
            },
            markerEnd: 'marker',
            markerStart: 'marker',
            data: {
              sourceField: field.id,
              targetField: field.toRelationMetadata.fromFieldMetadataId,
              relation: field.toRelationMetadata.relationType,
              sourceObject: sourceObj,
              targetObject: targetObj,
            },
          });
          if (!isUndefinedOrNull(sourceObj) && !isUndefinedOrNull(targetObj)) {
            g.setEdge(sourceObj, targetObj);
          }
        }
      }
      i++;
    }

    dagre.layout(g);

    nodes.forEach((node) => {
      const nodeWithPosition = g.node(node.id);
      node.position = {
        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        x: nodeWithPosition.x - node.width / 2,
        y: nodeWithPosition.y - node.height / 2,
      };
    });

    setNodes(nodes);
    setEdges(edges);
  }, [objectMetadataItems, setEdges, setNodes, theme]);

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <StyledContainer>
        <StyledCloseButton>
          <Button Icon={IconX} to="/settings/objects"></Button>
        </StyledCloseButton>
        <Markers />
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
    </SubMenuTopBarContainer>
  );
};
