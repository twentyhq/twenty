import { useEdgeSelected } from '@/workflow/workflow-diagram/hooks/useEdgeSelected';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { OnSelectionChangeParams, useOnSelectionChange } from '@xyflow/react';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated/graphql';

export const WorkflowDiagramCanvasEditableEffect = () => {
  const { setEdgeSelected, clearEdgeSelection } = useEdgeSelected();

  const isWorkflowBranchEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_BRANCH_ENABLED,
  );

  const handleSelectedEdges = useCallback(
    ({ edges }: OnSelectionChangeParams) => {
      if (!isWorkflowBranchEnabled) {
        return;
      }

      const selectedEdge = edges?.[0];

      if (!isDefined(selectedEdge)) {
        clearEdgeSelection();
        return;
      }

      setEdgeSelected({
        source: selectedEdge.source,
        target: selectedEdge.target,
      });
    },
    [isWorkflowBranchEnabled, setEdgeSelected, clearEdgeSelection],
  );

  useOnSelectionChange({
    onChange: handleSelectedEdges,
  });

  return null;
};
