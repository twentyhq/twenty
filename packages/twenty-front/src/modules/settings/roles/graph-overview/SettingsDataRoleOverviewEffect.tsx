import dagre from '@dagrejs/dagre';
import { useTheme } from '@emotion/react';
import { Edge, Node } from '@xyflow/react';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useFindAllRoles } from '@/settings/roles/hooks/useFindAllRoles';

type SettingsDataModelOverviewEffectProps = {
  setEdges: (edges: Edge[]) => void;
  setNodes: (nodes: Node[]) => void;
};

export const SettingsDataRoleOverviewEffect = ({
  setEdges,
  setNodes,
}: SettingsDataModelOverviewEffectProps) => {
  const theme = useTheme();
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
   const { roles, loading, refetch } = useFindAllRoles();
  useEffect(() => {
    if(roles?.length > 0){
      const items = roles;

      const g = new dagre.graphlib.Graph();
      g.setGraph({ rankdir: 'LR' });
      g.setDefaultEdgeLabel(() => ({}));

      const edges: Edge[] = [];
      const nodes = [];
      let i = 0;
      for (const object of items) {
        nodes.push({
          id: object.id,
          width: 220,
          height: 100,
          position: { x: i * 300, y: 0 },
          data: object,
          type: 'object',
        });
        g.setNode(object.id, { width: 220, height: 100 });

        if(object.reportsTo){
          const sourceObj = object.reportsTo?.id;
          const targetObj = object.reportsTo?.id;
          edges.push({
            id: `${sourceObj}-${targetObj}`,
            source: object.id,
            sourceHandle: `${object.id}-right`,
            target: object.reportsTo.id,
            targetHandle: `${object.reportsTo.id}-left`,
            type: 'smoothstep',
            style: {
              strokeWidth: 1,
              stroke: theme.color.gray,
            },
            markerEnd: 'marker',
            markerStart: 'marker',
            data: {
              sourceField: object.id,
              targetField: object.reportsTo.id,
              relation: 'ONE_TO_ONE',
              sourceObject: sourceObj,
              targetObject: targetObj,
            },
          });
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
      console.log('OBJECT METADATA ITEMS', nodes, edges)
      setNodes(nodes);
      setEdges(edges);
    }
   
  }, [roles, setEdges, setNodes, theme]);

  return <></>;
};
