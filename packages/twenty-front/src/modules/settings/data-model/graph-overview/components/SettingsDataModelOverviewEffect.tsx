import { useTheme } from '@emotion/react';
import { type Edge, type Node } from '@xyflow/react';
import { useEffect } from 'react';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { isDefined } from 'twenty-shared/utils';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

type SettingsDataModelOverviewEffectProps = {
  setEdges: (edges: Edge[]) => void;
  setNodes: (nodes: Node[]) => void;
};

export const SettingsDataModelOverviewEffect = ({
  setEdges,
  setNodes,
}: SettingsDataModelOverviewEffectProps) => {
  const theme = useTheme();
  const { activeNonSystemObjectMetadataItems: items } =
    useFilteredObjectMetadataItems();

  useEffect(() => {
    const loadDagreAndLayout = async () => {
      const dagre = await import('@dagrejs/dagre');

      const g = new dagre.default.graphlib.Graph();
      g.setGraph({ rankdir: 'LR' });
      g.setDefaultEdgeLabel(() => ({}));

      const edges: Edge[] = [];
      const nodes: Node[] = [];
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
            isDefined(field.relation) &&
            isDefined(
              items.find(
                (x) => x.id === field.relation?.targetObjectMetadata.id,
              ),
            )
          ) {
            const sourceObj = field.relation?.sourceObjectMetadata.namePlural;
            const targetObj = field.relation?.targetObjectMetadata.namePlural;

            edges.push({
              id: `${sourceObj}-${targetObj}`,
              source: object.namePlural,
              sourceHandle: `${field.id}-right`,
              target: field.relation.targetObjectMetadata.namePlural,
              targetHandle: `${field.relation.targetObjectMetadata}-left`,
              type: 'smoothstep',
              style: {
                strokeWidth: 1,
                stroke: theme.color.gray,
              },
              markerEnd: 'marker',
              markerStart: 'marker',
              data: {
                sourceField: field.id,
                targetField: field.relation.targetFieldMetadata.id,
                relation: field.relation.type,
                sourceObject: sourceObj,
                targetObject: targetObj,
              },
            });
            if (
              !isUndefinedOrNull(sourceObj) &&
              !isUndefinedOrNull(targetObj)
            ) {
              g.setEdge(sourceObj, targetObj);
            }
          }
        }
        i++;
      }

      dagre.default.layout(g);

      nodes.forEach((node) => {
        const nodeWithPosition = g.node(node.id);
        node.position = {
          // We are shifting the dagre node position (anchor=center center) to the top left
          // so it matches the React Flow node anchor point (top left).
          x: nodeWithPosition.x - (node.width ?? 0) / 2,
          y: nodeWithPosition.y - (node.height ?? 0) / 2,
        };
      });

      setNodes(nodes);
      setEdges(edges);
    };

    loadDagreAndLayout();
  }, [items, setEdges, setNodes, theme]);

  return <></>;
};
