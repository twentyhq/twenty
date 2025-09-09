import { useEdgeState } from '@/workflow/workflow-diagram/workflow-edges/hooks/useEdgeState';
import {
  type OnSelectionChangeParams,
  useOnSelectionChange,
} from '@xyflow/react';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const WorkflowDiagramCanvasEditableEffect = () => {
  const { setEdgeSelected, clearEdgeSelected } = useEdgeState();

  const handleSelectedEdges = useCallback(
    ({ edges }: OnSelectionChangeParams) => {
      const selectedEdge = edges?.[0];

      if (!isDefined(selectedEdge)) {
        clearEdgeSelected();

        return;
      }

      setEdgeSelected({
        source: selectedEdge.source,
        target: selectedEdge.target,
      });
    },
    [setEdgeSelected, clearEdgeSelected],
  );

  useOnSelectionChange({
    onChange: handleSelectedEdges,
  });

  return null;
};
