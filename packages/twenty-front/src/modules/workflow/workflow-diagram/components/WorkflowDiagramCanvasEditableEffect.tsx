import { useEdgeState } from '@/workflow/workflow-diagram/workflow-edges/hooks/useEdgeState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  type OnSelectionChangeParams,
  useOnSelectionChange,
} from '@xyflow/react';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated/graphql';

export const WorkflowDiagramCanvasEditableEffect = () => {
  const { setEdgeSelected, clearEdgeSelected } = useEdgeState();

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
        clearEdgeSelected();

        return;
      }

      setEdgeSelected({
        source: selectedEdge.source,
        target: selectedEdge.target,
      });
    },
    [isWorkflowBranchEnabled, setEdgeSelected, clearEdgeSelected],
  );

  useOnSelectionChange({
    onChange: handleSelectedEdges,
  });

  return null;
};
